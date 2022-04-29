// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const settings = require('./settings.json')


const nouns = settings.words.nouns
const adjectives = settings.words.adjectives
const weightedWords = settings.words.weightedWords

const tradeCommand = new SlashCommandBuilder()
    .setName('trade')
    .setDescription("Trade nicknames with another user!")
    .addUserOption(option => option
        .setName('target')
        .setDescription('Select a user to trade with.')
        .setRequired(true)
        )

const forceRollCommand = new SlashCommandBuilder()
    .setName('forceroll')
    .setDescription("Reroll another user. Admin only.")
    .addUserOption(option => option
        .setName('target')
        .setDescription('Select a user to rename.')
        .setRequired(true)
        )

const rerollServerCommand = new SlashCommandBuilder()
    .setName('serverroll')
    .setDescription("Reroll everyone in the server")
    .addRoleOption(option => option.setName('saferole').setDescription('Define a safe role'))

const commands = [
    new SlashCommandBuilder().setName('reroll').setDescription('Roll a new nickname!'),
    new SlashCommandBuilder().setName('chance').setDescription("Check the chance of getting your nickname!"),
    new SlashCommandBuilder().setName('hold').setDescription("Be able to recover your name for " + formatMilisecondsToMinutes(settings.nameHoldTimer) + " minutes!"),
    rerollServerCommand,
    tradeCommand,
    forceRollCommand,
    new SlashCommandBuilder().setName('ping').setDescription("Check my status")
].map(command => command.toJSON())


const rest = new REST({ version: '9' }).setToken(token)

rest.put(Routes.applicationGuildCommands(settings.clientId, settings.serverId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error)

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBERS"],
})

client.on("guildMemberAdd", (member) => {
    nickname(member)
})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, member, channel } = interaction

    if (channel.id != settings.namerChannelId) {
        interaction.reply({ content: 'Use the reroll channel for this command!', ephemeral: true })
        return;
    }

    switch (commandName) {
        case 'ping':
            await interaction.reply('Pong!')
            break
        case 'reroll':
            const newName = await nickname(member)
            interaction.reply(getRenamedMessage(newName))
            break;
        case 'forceroll':
            if (member.id != settings.adminId) {  
                interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true })
                return
            }
            var target = interaction.options.getMember('target')
            nickname(target)
            interaction.reply(getUserHasBeenRenamedString(target))
            break;
        case 'trade':
            var target = interaction.options.getMember('target')
            initiateNameTrade(interaction, member, target)
            break;
        case 'hold':
            initiateNameHold(interaction, member)
            break;
        case 'chance':
            interaction.reply(getNameChanceString(member))
            break;
        case 'serverroll':
            if (member.id != settings.adminId) {  
                interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true })
                return
            }
            var safeRole = interaction.options.getRole('saferole')
            rerollServer(interaction, safeRole)
            break;
    }
})

async function rerollServer(interaction, safeRole) {
    var allMembers = (await interaction.guild.members.fetch())
    var counter = 0
    await interaction.reply(getRenamedCount(counter))
    await interaction.fetchReply()
    allMembers.forEach(async(member) => {
        if(member.id != interaction.guild.ownerId && (safeRole == null || !member.roles.cache.has(safeRole.id))) {
            counter++;
            await nickname(member)
        } else {
            interaction.channel.send(getMemberIsSafeMessage(member))
        }
        await interaction.editReply(getRenamedCount(counter))
    })

}

async function initiateNameHold(interaction, member) {
    const originalName = member.displayName
    await interaction.reply(formatNameHoldMessage(member, originalName))
    const message = await interaction.fetchReply()
    await message.react(settings.revertNameEmoji)
    let filter = (reaction, user) => {
        return (
          [settings.revertNameEmoji].includes(reaction.emoji.name) &&
          user.id != settings.clientId && user.id == member.id
        );
    };
    let collector = message.createReactionCollector({
        filter, max: 1, time: settings.nameHoldTimer
    })
    collector.on('collect', async(reaction, user) => {
        if (reaction.emoji.name == settings.revertNameEmoji) {
            member.setNickname(originalName)
        }
    })
    collector.on('end', async(collected) => {
        if (collected.size < 1) {
            interaction.followUp(getNameHoldTimedOutMessage(member, originalName))
        } else {
            interaction.followUp(getRecoveredNameMessage(member, originalName))
        }
    })

}

async function initiateNameTrade(interaction, trader, receiver) {
    await interaction.reply(formatTradeMessage(trader, receiver))
    const message = await interaction.fetchReply();
    await message.react(settings.acceptEmoji)
    await message.react(settings.declineEmoji)
    let filter = (reaction, user) => {
        return (
          [settings.acceptEmoji, settings.declineEmoji].includes(reaction.emoji.name) &&
          user.id != settings.clientId && user.id == receiver.id
        );
    };
    let collector = message.createReactionCollector({
        filter, max: 1, time: settings.tradeTimer
    })
    
    collector.on('collect', async(reaction, user) => {
        if (reaction.emoji.name == settings.acceptEmoji) {
            var tempName = receiver.displayName
            await receiver.setNickname(trader.displayName)
            await trader.setNickname(tempName)
            interaction.followUp(getSuccessfulTradeMessage(trader, receiver))
        } else if (reaction.emoji.name == settings.declineEmoji) {
            interaction.followUp(getDeclinedTradeMessage(trader, receiver))
        }
    })

    collector.on('end', async(collected) => {
        if (collected.size < 1) {
            interaction.followUp(getTradeTimedOutMessage())
        }
    })
}

function getMemberIsSafeMessage(member) {
    return tagById(member.id) + " is safe. Skipping user."
}

function getRenamedCount(count) 
{
    return codeText("Renamed " + count +" users")
}

function getNameChanceString(member) {
    var memberNameParts = member.displayName.split(" ")
    var wordToChanceMap = new Map()
    memberNameParts.forEach(word => {
        var chanceOfWord = chanceOfGettingWord(word).toFixed(5)
        if (chanceOfWord == -1) {
            return codeText("It looks like I have not named you." + codeText(member.displayName) + " is not a valid combination.")
        } else {
            wordToChanceMap.set(word, chanceOfWord)
        }
    })
    var chanceStr = "Probability Tracking"
    var totalProbability = 1.0
    for (const [key, value] of wordToChanceMap) {
        chanceStr += "\n"+key + " : " + formatPercentage(value)
        totalProbability *= value
    }
    return codeText(chanceStr)
}

/**
 * If the word is in a tier, adjectives, or nouns array and return the chance of getting it.
 * If it is in no tier, return -1, indicating an improper name.
 * @param {String} word 
 */
 function chanceOfGettingWord(word) {
    if (settings.words.weightedWords.tier1.includes(word)) {
        return 1 / settings.words.weightedWords.tier1.length
    } else if (settings.words.weightedWords.tier2.includes(word)) {
        return 1 / settings.words.weightedWords.tier2.length
    } else if (settings.words.weightedWords.tier3.includes(word)) {
        return 1 / settings.words.weightedWords.tier3.length
    } else if (settings.words.weightedWords.tier4.includes(word)) {
        return 1 / settings.words.weightedWords.tier4.length
    }
    else if (settings.words.weightedWords.tier5.includes(word)) {
        return 1 / settings.words.weightedWords.tier5.length
    }
    else if (settings.words.weightedWords.tier6.includes(word)) {
        return 1 / settings.words.weightedWords.tier6.length
    }
    else if (settings.words.weightedWords.tier7.includes(word)) {
        return 1 / settings.words.weightedWords.tier7.length
    }
    else if (settings.words.weightedWords.tier8.includes(word)) {
        return 1 / settings.words.weightedWords.tier8.length
    } else if (adjectives.includes(word)) {
        return 1 / adjectives.length
    } else if (nouns.includes(word)) {
        return 1 / nouns.length
    }
    else {
        return -1
    }

}

/**
 * Choose a random element from the array
 */
function chooseRandom(array){
    return array[Math.floor(Math.random()*array.length)]
}


function getUserHasBeenRenamedString(member) {
    return tagById(member.id) + " has been renamed!"
}

function formatPercentage(decimalValue) {
    return (decimalValue * 100).toFixed(2) + "%"
}

function formatTradeMessage(trader, receiver) {
    return tagById(trader.id) + " would like to trade their name with " + tagById(receiver.id) + ". React " + settings.acceptEmoji + " to accept the trade or " + settings.declineEmoji + "to decline."
}

function getDeclinedTradeMessage(sender, receiver) {
    return tagById(receiver.id) + " has declined the trade from " + tagById(sender.id)
}

function getSuccessfulTradeMessage(sender, receiver) {
    return tagById(receiver.id) + " has accepted the trade from " + tagById(sender.id)
}

function getTradeTimedOutMessage() {
    return "The trade window has timed out!"
}

function formatNameHoldMessage(user, heldName) {
    return tagById(user.id) + "- I will hold " + codeText(heldName) + " for " + formatMilisecondsToMinutes(settings.nameHoldTimer) + " minutes. React " + settings.revertNameEmoji + " to recover this name."
}

function getRecoveredNameMessage(member, originalName) {
    return tagById(member.id) + " has been reverted to " + codeText(originalName)
}

function getNameHoldTimedOutMessage(member, originalName) {
    return tagById(member.id) + " has been not recovered " + codeText(originalName)
}

function getRenamedMessage(newName) {
    return "You have been renamed to " + boldText(newName)
}

function formatMilisecondsToMinutes(miliseconds) {
    return Math.round(miliseconds / 60000)
}

function boldText(str) {
    return "**" + str + "**"
}

function codeText(str) {
    return "```" + str + "```"
}

function tagById(id) {
    return "<@" + id + ">"
}

/**
 * Nicknames a member
 * @param {member} - The member object to be renamed
 */
 function nickname(member){
    var oldName = member.displayName
    var newName = getAWeightedWord() + " " + chooseRandom(nouns)+ " " + chooseRandom(adjectives) + " " + chooseRandom(nouns)
    if (newName.length >= 32) {
        newName = nickname(member)
    }
    try{
        member.setNickname(newName)
        console.log(oldName + " has been renamed to " + newName)
    } catch (error) {
        console.log(error)
    }
    return newName
}

function getAWeightedWord(){
    var chanceRoll = Math.random()
    if (chanceRoll < settings.tierThreshholds.tier1) {
        return chooseRandom(weightedWords.tier1)
    }
    if (chanceRoll < settings.tierThreshholds.tier2) {
        return chooseRandom(weightedWords.tier2)
    }
    if (chanceRoll < settings.tierThreshholds.tier3) {
        return chooseRandom(weightedWords.tier3)
    }
    if (chanceRoll < settings.tierThreshholds.tier4) {
        return chooseRandom(weightedWords.tier4)
    }
    if (chanceRoll < settings.tierThreshholds.tier5) {
        return chooseRandom(weightedWords.tier5)
    }
    if (chanceRoll < settings.tierThreshholds.tier6) {
        return chooseRandom(weightedWords.tier6)
    }
    if (chanceRoll < settings.tierThreshholds.tier7) {
        return chooseRandom(weightedWords.tier7)
    } else {
        return chooseRandom(weightedWords.tier8)
    }
}
/**
 * When the bot turns on
 */
 client.on("ready", () => {
    console.log("Bot is online!")
    client.user.setActivity("Use !reroll in the reroll-nickname channel.")
})


/**
 * Log into the bot profile.
 */
client.login(token)


