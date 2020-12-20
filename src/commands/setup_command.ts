import { Collection, CollectorFilter, Message } from "discord.js";
import { stringify } from "querystring";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    /*if(!settings) return message.channel.send("This command can only be run in a server").catch(console.error);
    if(message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    let eventSettings = await getEventSettings(settings.id);
    await message.channel.send("Welcome to the EconomyBot setup wizard! After each prompt, type in what you would like the value to be. Let's start with what you'd like the prefix to be.").catch(console.error);

    settings.prefix = (await getMessage(message)).content;
    if(settings.prefix == null) return;
    await message.channel.send(`The prefix has been set to ${settings.prefix}. What would you like to call your server's currency?`).catch(console.error);

    settings.currency = (await getMessage(message)).content;
    if(settings.currency == null) return;
    await message.channel.send(`Your currency has been named ${settings.currency}. What should the default balance be?`).catch(console.error);

    let defBalance = (await getMessage(message)).content;
    if(defBalance == null) return;
    settings.defaultBalance = Number(defBalance);
    console.dir(settings.defaultBalance);
    console.log(typeof settings.defaultBalance);
    while(isNaN(settings.defaultBalance) || settings.defaultBalance == Infinity || settings.defaultBalance == -Infinity) {
        await message.channel.send("The default balance must be a number! What would you like the default balance to be?").catch(console.error);
        settings.defaultBalance = Number((await getMessage(message)).content);
        console.dir(settings.defaultBalance);
        console.log(typeof settings.defaultBalance);
    }
    await message.channel.send(`You have set the default balance to ${settings.defaultBalance}. Would you like to enable rewards for sending messages? (yes or no)`).catch(console.error);

    let watchMessages = (await getMessage(message)).content;
    if(watchMessages == null) return;
    while(watchMessages.toLowerCase() != "yes" && watchMessages.toLowerCase() != "no") {
        await message.channel.send("The answer must be \"yes\" or \"no\". Would you like to enable rewards for sending messages?").catch(console.error);
        watchMessages = (await getMessage(message)).content;
        if(watchMessages == null) return;
    }
    eventSettings.watchMessages = watchMessages.toLowerCase() == "yes" ? true : false;

    await message.channel.send(`You have chosen to ${eventSettings.watchMessages ? "enable" : "disable"} message rewards.`).catch(console.error);

    if(eventSettings.watchMessages) {
        await message.channel.send("What would you like the reward for messaging to be?").catch(console.error);
        let messageReward = (await getMessage(message)).content;
        if(messageReward == null) return;
        eventSettings.messageReward = Number(messageReward);
        while(isNaN(eventSettings.messageReward) || eventSettings.messageReward == Infinity || eventSettings.messageReward == -Infinity) {
            await message.channel.send("The message reward must be a number! What would you like the message reward to be?").catch(console.error);
            eventSettings.messageReward = Number((await getMessage(message)).content);
        }
        await message.channel.send(`You have set the reward for messaging to ${eventSettings.messageReward}. What would you like the cooldown (in milliseconds) between message rewards to be?`).catch(console.error);

        let messageCooldown = (await getMessage(message)).content;
        if(messageCooldown == null) return;
        eventSettings.messageCooldown = Number(messageCooldown)
        while(isNaN(eventSettings.messageCooldown) || eventSettings.messageCooldown == Infinity || eventSettings.messageCooldown == -Infinity) {
            await message.channel.send("The message cooldown must be a number! What would you like the message cooldown to be?").catch(console.error);
            eventSettings.messageCooldown = Number((await getMessage(message)).content);
        }
        await message.channel.send(`You have set the cooldown for messaging to ${eventSettings.messageCooldown}.`).catch(console.error);
    }

    await message.channel.send("Would you like to enable rewards for inviting people to your server?").catch(console.error);

    let watchInvites = (await getMessage(message)).content;
    if(watchInvites == null) return;
    while(watchInvites.toLowerCase() != "yes" && watchInvites.toLowerCase() != "no") {
        await message.channel.send("The answer must be \"yes\" or \"no\". Would you like to enable rewards for inviting people? (yes or no)").catch(console.error);
        watchInvites = (await getMessage(message)).content;
        if(watchInvites == null) return;
    }
    eventSettings.referrals = watchInvites.toLowerCase() == "yes" ? true : false;

    await message.channel.send(`You have chosen to ${eventSettings.referrals ? "enable" : "disable"} invite rewards.`).catch(console.error);

    if(eventSettings.referrals) {
        await message.channel.send("What would you like the reward for inviting people to be?").catch(console.error);
        let referrerAmount = (await getMessage(message)).content;
        if(referrerAmount == null) return;
        eventSettings.referrerAmount = Number(referrerAmount);
        while(isNaN(eventSettings.referrerAmount) || eventSettings.referrerAmount == Infinity || eventSettings.referrerAmount == -Infinity) {
            await message.channel.send("The message reward must be a number! What would you like the invite reward to be?").catch(console.error);
            eventSettings.referrerAmount = Number((await getMessage(message)).content);
        }
        await message.channel.send(`You have set the reward for inviting people to ${eventSettings.referrerAmount}`).catch(console.error);
    }

    await settings.save().catch((e) => {message.channel.send("There was an error saving your settings. Report this as soon as possible.").catch(console.error);console.error(e)});
    await eventSettings.save().catch((e) => {message.channel.send("There was an error saving your settings. Report this as soon as possible.").catch(console.error);console.error(e)});

    message.channel.send("Congratulations! You've completed the setup wizard! Go out and enjoy EconomyBot to its fullest extent.").catch(console.error);
    */
}

async function getMessage(message: Message) {
    const returnNull:{content:any} = {content:null};
    const filter = (m: Message) => m.author.id == message.author.id;
    let r = await message.channel.awaitMessages(filter, {time: 10000, max: 1, errors:["time"]}).catch(() => message.channel.send("Oops! You ran out of time. The wizard has aborted and no settings have been saved.").catch(console.error));
    if(!(r instanceof Collection)) return returnNull;
    return (r as Collection<string, Message>).first();
}

export const name = "setup";
export const category = HelpCategories.ADMIN;
export const help = "This command will invoke the setup wizard. It helps guide you through the configuration process.";