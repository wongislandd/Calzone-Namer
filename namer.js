const Discord = require("discord.js");
const { strict } = require("assert");
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
})

const adjectives = ["biggest", "medium", "smallest", "big", "small", "no"]
const nouns = ["pp", "mouth", "belly", "poggers", "simp", "brain", "head", "meme", "butt", "toe", "foot",
                "cat", "dog", "clam", "rat", "poop", "dinkleberry", "heart"]

client.on("guildMemberAdd", (member) => {
    nickname(member)
    member.send("You have been renamed by the Calzone Namer.")
})

var PREFIX = "!"
const CHRIS = "110128099361849344";
const botSpamChannel = "738062969493258392"
var oddsToGetBest = .005
var defaultOddsOfRare = .005

client.on("message", (msg) => {
    if(!msg.content.startsWith(PREFIX) || msg.channel.id != botSpamChannel)
        return
    let args = msg.content.substring(PREFIX.length).split(" ")
    switch(args[0]) {
        case "nickname":
            try{
                msg.reply("You have been renamed to **" + nickname(msg.member) +"**")
                msg.delete()
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
            msg.guild.members.cache.forEach(member => nickname(member))
            msg.reply("Renaming everyone. Please wait.")
            break
        case "setProbability":
            if (msg.author.id != CHRIS){
                msg.reply("That's illegal.")
                return
            }
            oddsToGetBest = parseFloat(args[1])
            msg.channel.send("```Odds have been changed to " + args[1] + " for " + args[2] + " seconds.```")
            // Reset after timeout
            setTimeout(function(){ 
                oddsToGetBest = defaultOddsOfRare
                msg.channel.send("```Odds have been returned to " + defaultOddsOfRare + "```")
            }, parseInt(args[2]) * 1000);
            break;
        case "ping":
            msg.reply("Pong!")
            break
    }
})
/**
 * Nicknames a member
 * @param {member} - The member object to be renamed
 */
function nickname(member){
    var newName = getAnAdjective() + " " + getANoun() + " " + getAnAdjective() + " " + getANoun()
    if (newName.length >= 32) {
        newName = newName.substring(0,32)
    }
    try{
        member.setNickname(newName)
        console.log(member.displayName + " was renamed.")
    } catch (error) {
        console.log(error)
    }
    return newName
}

/**
 * Grabs a label from nouns
 * @returns An adjective
 */
function getAnAdjective(){
    var chanceRoll = Math.random()
    if (chanceRoll < oddsToGetBest) {
        if(chanceRoll < oddsToGetBest/2) {
            return "bestest"
        } else {
            return "best"
        }
    } else {
        return adjectives[Math.floor(Math.random() * adjectives.length)]
    }
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
client.login("NzM3MTUyNjM4MTgwNzg2MjY3.Xx5M5A.BtIm3K9CcGl4j4zrfALO_ObMNVw")