require('dotenv').config()
const { Client, Intents }= require("discord.js");
const { strict } = require("assert");
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBERS"],
})

const adjectives = ["abrupt", "acidic", "adorable", "adventurous", "aggressive", "agitated", "alert", "aloof", "amiable", "amused", "annoyed", "antsy", "anxious", "appalling", "appetizing", "apprehensive", "arrogant", "ashamed", "astonishing", "attractive", "average", "batty", "bewildered", "biting", "bitter", "bland", "blushing", "bored", "brave", "bright", "broad", "bulky", "burly", "charming", "cheeky", "cheerful", "chubby", "clean", "clear", "cloudy", "clueless", "clumsy", "colorful", "combative", "comfortable", "condemned", "condescending", "confused", "contemplative", "convincing", "convoluted", "cooperative", "corny", "costly", "courageous", "crabby", "creepy", "crooked", "cruel", "cumbersome", "curved", "cynical", "dangerous", "dashing", "decayed", "deceitful", "deep", "defeated", "defiant", "delicious", "delightful", "depraved", "depressed", "despicable", "determined", "dilapidated", "disgusted", "distinct", "distraught", "distressed", "disturbed", "dizzy", "drab", "drained", "dull", "eager", "ecstatic", "elated", "elegant", "emaciated", "embarrassed", "enchanting", "encouraging", "energetic", "enthusiastic", "envious", "exasperated", "excited", "exhilarated", "extensive", "exuberant", "fancy", "fantastic", "fierce", "filthy", "flat", "floppy", "fluttering", "foolish", "frantic", "fresh", "friendly", "frightened", "frothy", "frustrating", "funny", "fuzzy", "gaudy", "gentle", "ghastly", "giddy", "glamorous", "gleaming", "glorious", "gorgeous", "graceful", "greasy", "grieving", "gritty", "grotesque", "grubby", "grumpy", "handsome", "happy", "harebrained", "healthy", "helpful", "helpless", "high", "hollow", "homely", "horrific", "hungry", "hurt", "icy", "ideal", "impressionable", "intrigued", "irate", "irritable", "itchy", "jealous", "jittery", "jolly", "joyous", "juicy", "jumpy", "kind", "lackadaisical", "lazy", "lethal", "little", "lively", "livid", "lonely", "loose", "lovely", "lucky", "ludicrous", "macho", "magnificent", "maniacal", "melancholy", "melted", "mistaken", "misty", "moody", "mortified", "motionless", "muddy", "mysterious", "narrow", "nasty", "naughty", "nervous", "nonchalant", "nonsensical", "nutritious", "obedient", "oblivious", "obnoxious", "odd", "old-fashioned", "outrageous", "panicky", "perplexed", "petite", "petty", "plain", "pleasant", "poised", "pompous", "precious", "prickly", "proud", "pungent", "quaint", "quizzical", "ratty", "reassured", "relieved", "repulsive", "responsive", "ripe", "robust", "rotten", "rotund", "rough", "round", "salty", "sarcastic", "scant", "scary", "scattered", "selfish", "shaggy", "shaky", "shallow", "sharp", "shiny", "silky", "silly", "skinny", "slimy", "slippery", "smarmy", "smiling", "smoggy", "smooth", "smug", "soggy", "solid", "sore", "sour", "sparkling", "splendid", "spotless", "square", "stale", "steady", "steep", "sticky", "stormy", "stout", "straight", "strange", "strong", "stunning", "substantial", "successful", "succulent", "superficial", "superior", "swanky", "sweet", "tart", "tasty", "tender", "tense", "terrible", "testy", "thankful", "thick", "thoughtful", "thoughtless", "tight", "timely", "tricky", "trite", "troubled", "twitter", "pated", "uneven", "unsightly", "upset", "uptight", "vexed", "victorious", "virtuous", "vivacious", "vivid", "wacky", "weary", "whimsical", "whopping", "wicked", "witty", "wobbly", "wonderful", "worried", "yummy", "zany", "zealous", "zippy"]
const nouns = ["pp", "mouth", "belly", "poggers", "simp", "brain", "head", "meme", "butt", "toe", "foot",
                "cat", "dog", "clam", "rat", "poop", "dinkleberry", "heart", "nut", "cashew", "gamer", "panda", 
                "tea", "nest", "year", "bone", "streamer", "watcher", "criminal", "baby", "human", "bot", "libtard"]


/* Size Tier Arrays */
const tier1 = ["no", "sad", "mad", "balding", "malding", "hostage", "trash", "sadge", "smoge"]
const tier2 = ["smallest", "tiniest", "littlest"]
const tier3 = ["small", "tiny", "little", "miniature"]
const tier4 = ["medium", "average", "moderate", "normal", "usual", "standard", "nutty", "blue"]
const tier5 = ["cruel", "big", "large", "huge", "hefty", "sizable", "fat", "considerable", "substantial", "heavy", "copious", "illegal"]
const tier6 = ["biggest", "largest", "hugest", "immense", "enormous", "colossal", "massive", "mammoth", "momentous", "vast", "tremendous", "disloyal"]
const tier7 = ["best", "rare", "happy", "spicy", "milky", "scammazed"]
const tier8 = ["legendary", "rarest", "pak", "nutty", "bone"]

/* Reactions */
const ACCEPT_EMOJI = "🟢";
const DECLINE_EMOJI = "🔴";

/* Probabilities */
const tier1Threshold = .27 // 27%
const tier2Threshold = .49 // 22%
const tier3Threshold = .67 // 18%
const tier4Threshold = .805 // 13.5%
const tier5Threshold = .9 // 9.5%
const tier6Threshold = .96 // 6%
const tier7Threshold = .99 // 3%
const tier8Threshold = 1.0 // 1%

const chanceOfTier1 = tier1Threshold/tier1.length
const chanceOfTier2 = (tier2Threshold-tier1Threshold)/tier2.length
const chanceOfTier3 = (tier3Threshold-tier2Threshold)/tier3.length
const chanceOfTier4 = (tier4Threshold-tier3Threshold)/tier4.length
const chanceOfTier5 = (tier5Threshold-tier4Threshold)/tier5.length
const chanceOfTier6 = (tier6Threshold-tier5Threshold)/tier6.length
const chanceOfTier7 = (tier7Threshold-tier6Threshold)/tier7.length
const chanceOfTier8 = (tier8Threshold-tier7Threshold)/tier8.length



client.on("guildMemberAdd", (member) => {
    nickname(member)
    member.send("You have been renamed by the Calzone Namer.")
})

var PREFIX = "!"
const CHRIS = "110128099361849344";
const botSpamChannel = "738062969493258392"
const safeRole = "flex"
const BOTID = "737152638180786267"

var probabilityMultiplier = 1
var defaultProabilityMultiplier = 1

client.on("message", async (msg) => {
    if(!msg.content.startsWith(PREFIX) || msg.channel.id != botSpamChannel)
        return
    let args = msg.content.substring(PREFIX.length).split(" ")
    switch(args[0]) {
        case "reroll":
        case "nickname":
            try{
                const ret = nickname(msg.member)
                msg.reply("You have been renamed to **" + ret +"**")
            }
            catch (error){
                console.log(error)
                msg.reply("I was unable to rename you.")
            }
            break
        case "nicknameUser":
            if (msg.author.id != CHRIS){
                msg.reply("That's illegal.")
                return
            }
            try{
                var memberFound = msg.guild.members.cache.find((member) => member.id == args[1])
                if(memberFound != null) {
                    nickname(memberFound)
                    msg.reply(memberFound.displayName + " was renamed to **" + nickname(memberFound) + "**")
                } else{
                    msg.reply("User could not be found.")
                }
            } catch(error){
                console.log(error)
            }
            break
        case "nicknameAll":
            if (msg.author.id != CHRIS){
                msg.reply("That's illegal.")
                return
            }
            var allMembers = (await msg.guild.members.fetch())
            var counter = 0
            const countMessage = (await msg.channel.send(getRenamedCount(counter)))
            allMembers.forEach((member) => {
                if(member.id != CHRIS && !member.roles.cache.has(safeRole)){
                    counter++;
                    nickname(member)
                }
                countMessage.edit(getRenamedCount(counter))
            })
            break
        case "chance":
            var chance = figureOutNameChance(msg.member)
            if (chance != -1) {
                msg.reply("```The chance of receiving " + msg.member.displayName+ " is " + chance + parsePercentageFromFloat(chance) + ".```")
            } else {
                msg.reply("```I couldn't find the chance for your name. This is probably because I haven't named you.```")
            }
            break
        case "chanceOfUser":
            try{
                var memberFound = msg.guild.members.cache.find((member) => member.id == args[1])
                if(memberFound != null) {
                    var chance = figureOutNameChance(memberFound)
                    if (chance != -1) {
                        msg.reply("```The chance of receiving " + memberFound.displayName+ " is " + chance + parsePercentageFromFloat(chance) + ".```")
                    } else {
                        msg.reply("```I couldn't find the chance for your name. This is probably because I haven't named you.```")
                    }
                }
            } catch(error){
                console.log(error)
            }
            break;
        case "trade":
            try {
                var memberId = args[1].replace(/[^0-9]/g,'')
                var memberFound = msg.guild.members.cache.find((member) => member.id == memberId )
                if (memberId == CHRIS || msg.author.id == CHRIS) {
                    msg.reply("Chris is not allowed to trade nicknames :(")
                    break;
                }
                if(memberFound != null) {
                    msg.reply(formatTradeMessage(msg.author, memberFound)).then(async botMessage => {
                        await botMessage.react(ACCEPT_EMOJI);
                        await botMessage.react(DECLINE_EMOJI);
                        let filter = (reaction, user) => {
                            return (
                              [ACCEPT_EMOJI, DECLINE_EMOJI].includes(reaction.emoji.name) &&
                              user.id != BOTID && user.id == memberFound.id
                            );
                          };
                        let collector = botMessage.createReactionCollector({ filter, max: 1, time: 15000 })

                        collector.on('collect', (reaction, user) => {
                            if (reaction.emoji.name == ACCEPT_EMOJI) {
                                try {
                                    var tempName = msg.member.displayName
                                    msg.member.setNickname(memberFound.displayName)
                                    memberFound.setNickname(tempName)
                                    msg.channel.send("<@" + memberFound.user.id +"> has successfully accepted the trade.")
                                } catch (exception) {
                                    console.log(exception)
                                }
                            } else if (reaction.emoji.name == DECLINE_EMOJI) {
                                msg.channel.send("<@" + memberFound.user.id +"> has declined the trade.")
                            }
                            collector.stop()
                        })
                        collector.on('end', (collected) => {
                            console.log("Trade Request timed out")
                            if (collected.size < 1) {
                                botMessage.reply("Trade request has timed out.")
                            }
                        })
                    })
                }
            } catch(error) {
                console.log(error)
            }
            break;
        case "setProbability":
            if (msg.author.id != CHRIS){
                msg.reply("That's illegal.")
                return
            }
            probabilityMultiplier = parseFloat(args[1])
            msg.channel.send("```Probability multiplier has been changed to " + args[1] + " for " + args[2] + " seconds.```")
            // Reset after timeout
            setTimeout(function(){ 
                probabilityMultiplier = defaultProabilityMultiplier
                msg.channel.send("```Probability multiplier has been returned to " + defaultProabilityMultiplier + "```")
            }, parseInt(args[2]) * 1000);
            break;
        case "probabilities":
            msg.channel.send("```" + "Probabilities:" + "\n\n" + 
                "Tier 1- " + parsePercentageFromFloat(chanceOfTier1) + " : " + tier1 +"\n" + 
                "Tier 2- " + parsePercentageFromFloat(chanceOfTier2) + " : " + tier2 +"\n" + 
                "Tier 3- " + parsePercentageFromFloat(chanceOfTier3) + " : " + tier3 +"\n" + 
                "Tier 4- " + parsePercentageFromFloat(chanceOfTier4) + " : " + tier4 +"\n" + 
                "Tier 5- " + parsePercentageFromFloat(chanceOfTier5) + " : " + tier5 +"\n" + 
                "Tier 6- " + parsePercentageFromFloat(chanceOfTier6) + " : " + tier6 +"\n" + 
                "Tier 7- " + parsePercentageFromFloat(chanceOfTier7) + " : " + tier7 +"\n" + 
                "Tier 8- " + parsePercentageFromFloat(chanceOfTier8) + " : " + tier8 +"\n" +
                "-dan wu```")
            break
        case "ping":
            msg.reply("Pong!")
            break
    }
})

function formatTradeMessage(sender, receiver) {
    return "<@" + sender.id +"> would like to trade their name with <@"+receiver.id+">. React " + ACCEPT_EMOJI + " to accept the trade or " + DECLINE_EMOJI + "to decline."
}

function getRenamedCount(count) 
{
    return "```Renamed " + count +" users```"
}

/**
 * Nicknames a member
 * @param {member} - The member object to be renamed
 */
function nickname(member){
    var newName = getAWeightedAdjective() + " " + getANoun() + " " + getAnAdjective() + " " + getANoun()
    if (newName.length >= 32) {
        newName = nickname(member)
    }
    try{
        member.setNickname(newName)
        console.log(member.user.tag + " was renamed to " + member.displayName)
    } catch (error) {
        console.log(error)
    }
    return newName
}

function figureOutNameChance(member) {
        var authorNameParts = member.displayName.split(" ")
        var currentChance = 1.00
        for (var i=0;i<authorNameParts.length;i++) {
            var chanceOfWord = chanceOfGettingWord(authorNameParts[i])
            console.log(authorNameParts[i], chanceOfWord)
            if (chanceOfWord != -1) {
                currentChance = currentChance * chanceOfWord
            } else {
                return -1
            }
        }
        return currentChance
}

/**
 * If the word is in a tier, adjectives, or nouns array and return the chance of getting it.
 * If it is in no tier, return -1, indicating an improper name.
 * @param {String} word 
 */
function chanceOfGettingWord(word) {
    if (tier1.includes(word)) {
        return chanceOfTier1
    } else if (tier2.includes(word)) {
        return chanceOfTier2
    } else if (tier3.includes(word)) {
        return chanceOfTier3
    } else if (tier4.includes(word)) {
        return chanceOfTier4
    }
    else if (tier5.includes(word)) {
        return chanceOfTier5
    }
    else if (tier6.includes(word)) {
        return chanceOfTier6
    }
    else if (tier7.includes(word)) {
        return chanceOfTier7
    }
    else if (tier8.includes(word)) {
        return chanceOfTier8
    } else if (adjectives.includes(word)) {
        return 1/adjectives.length
    } else if (nouns.includes(word)) {
        return 1/nouns.length
    }
    else {
        return -1
    }

}


function getAWeightedAdjective(){
    var chanceRoll = Math.random() * probabilityMultiplier
    console.log(chanceRoll)
    if (chanceRoll < tier1Threshold) {
        console.log("TIER 1")
        return chooseRandom(tier1)
    }
    if (chanceRoll < tier2Threshold) {
        console.log("TIER 2")
        return chooseRandom(tier2)
    }
    if (chanceRoll < tier3Threshold) {
        console.log("TIER 3")
        return chooseRandom(tier3)
    }
    if (chanceRoll < tier4Threshold) {
        console.log("TIER 4")
        return chooseRandom(tier4)
    }
    if (chanceRoll < tier5Threshold) {
        console.log("TIER 5")
        return chooseRandom(tier5)
    }
    if (chanceRoll < tier6Threshold) {
        console.log("TIER 6")
        return chooseRandom(tier6)
    }
    if (chanceRoll < tier7Threshold) {
        console.log("TIER 7")
        return chooseRandom(tier7)
    } else {
        console.log("TIER 8")
        return chooseRandom(tier8)
    }
}

/**
 * Parses a float into a string % rounded to the hundredths place
 */
function parsePercentageFromFloat(float){
    return  (Math.round(100*(float*100))/100).toString() + "%"
}

/**
 * Choose a random element from the array
 */
function chooseRandom(array){
    return array[Math.floor(Math.random()*array.length)]
}
/**
 * Grabs a label from nouns
 * @returns An adjective
 */
function getAnAdjective(){
    return adjectives[Math.floor(Math.random() * adjectives.length)]
}

/**
 * Grabs a noun from nouns
 * @returns A noun
 */
function getANoun(){
    return nouns[Math.floor(Math.random() * nouns.length)]
}


/**
 * When the bot turns on
 */
client.on("ready", () => {
    console.log("Bot is online!")
    client.user.setActivity("Use !nickname in the reroll-nickname channel.")
})


/**
 * Log into the bot profile.
 */
client.login(process.env.LIVE_BOT_TOKEN)

