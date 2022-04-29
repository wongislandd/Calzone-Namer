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

const commands = [
    new SlashCommandBuilder().setName('reroll').setDescription('Roll a new nickname!'),
    new SlashCommandBuilder().setName('chance').setDescription("Check the chance of getting your nickname!"),
    tradeCommand,
    new SlashCommandBuilder().setName('ping').setDescription("Check my status")
].map(command => command.toJSON())


const rest = new REST({ version: '9' }).setToken(token)
const CLIENT_ID = "737152638180786267"
const CALZONE_GUILD_ID = "138024094166810624"

rest.put(Routes.applicationGuildCommands(CLIENT_ID, CALZONE_GUILD_ID), { body: commands })
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
        case 'trade':
            const target = interaction.options.getMember('target')
            initiateNameTrade(interaction, member, target)
            break;

    }
})

/**
 * Choose a random element from the array
 */
 function chooseRandom(array){
    return array[Math.floor(Math.random()*array.length)]
}


function formatTradeMessage(trader, receiver) {
    return tagById(trader.id) + " would like to trade their name with " + tagById(receiver.id) + ". React " + settings.acceptEmoji + " to accept the trade or " + settings.declineEmoji + "to decline."
}

async function initiateNameTrade(interaction, trader, receiver) {
    await interaction.reply(formatTradeMessage(trader, receiver))
    const message = await interaction.fetchReply();
    await message.react(settings.acceptEmoji)
    await message.react(settings.declineEmoji)
    let filter = (reaction, user) => {
        return (
          [settings.acceptEmoji, settings.declineEmoji].includes(reaction.emoji.name) &&
          user.id != CLIENT_ID && user.id == receiver.id
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

}

function getRenamedMessage(newName) {
    return "You have been renamed to " + boldText(newName)
}

function getDeclinedTradeMessage(sender, receiver) {
    return tagById(receiver.id) + " has declined the trade from " + tagById(sender.id)
}

function getSuccessfulTradeMessage(sender, receiver) {
    return tagById(receiver.id) + " has accepted the trade from " + tagById(sender.id)
}

function boldText(str) {
    return "**" + str + "**"
}

function codeText(str) {
    return "``" + str + "``"
}

function tagById(id) {
    return "<@" + id + ">"
}

/**
 * Nicknames a member
 * @param {member} - The member object to be renamed
 */
 function nickname(member){
    var newName = getAWeightedWord() + " " + chooseRandom(nouns)+ " " + chooseRandom(adjectives) + " " + chooseRandom(nouns)
    if (newName.length >= 32) {
        newName = nickname(member)
    }
    try{
        member.setNickname(newName)
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


