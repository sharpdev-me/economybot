import { Message, MessageEmbed } from "discord.js";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    /*if(!settings) {
        // For future: allow users to change whether or not others can view their balances
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    const eventSettings = await getEventSettings(settings.id);
    if(args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(0xFFF700)
            .setFooter("Run `settings <setting> <value>` to change a value.")
            .setTitle("Server Settings")
            .setThumbnail(message.guild.iconURL());
        let value = "";

        value += `\`prefix\`: ${settings.prefix} - The symbol placed before commands\n`;
        value += `\`defaultBalance\`: ${settings.defaultBalance} - The balance to give new members\n`;
        value += `\`currency\`: ${settings.currency} - The name of your currency\n`;
        value += `\`watchMessages\`: ${eventSettings.watchMessages} - Enable rewards for sending messages\n`;
        value += `\`messageReward\`: ${eventSettings.messageReward} - The amount to reward a message\n`;
        value += `\`messageCooldown\`: ${eventSettings.messageCooldown} - The time in milliseconds between messages to get a reward\n`;
        value += `\`referrals\`: ${eventSettings.referrals} - Enable getting rewards for referrals\n`;
        value += `\`referrerAmount\`: ${eventSettings.referrerAmount} - The amount to give the referrer when their link is used\n`;
        

        embed.setDescription(value);

        return message.channel.send(embed).catch(console.error);
    }
    if(args.length < 2) {
        return message.channel.send("Proper usage is `settings [<setting> <value>]`").catch(console.error);
    }
    const setting = args[0];
    switch(setting) {
        case "prefix":
            settings.prefix = args[1];
            break;
        case "defaultBalance":
            let n = Number(args[1]);
            if(isNaN(n) || n == Infinity || n == -Infinity) {
                return message.channel.send("defaultBalance must be a number!").catch(console.error);
            }
            settings.defaultBalance = n;
            break;
        case "currency":
            settings.currency = args[1];
            break;
        case "watchMessages":
            let s = args[1];
            let v: boolean;
            if(s === "true") {
                v = true;
            } else if(s === "false") {
                v = false;
            } else {
                return message.channel.send("watchMessages must be either `true` or `false`").catch(console.error);
            }
            eventSettings.watchMessages = v;
            break;
        case "messageReward":
            let n1 = Number(args[1]);
            if(isNaN(n1) || n1 == Infinity || n == -Infinity) {
                return message.channel.send("messageReward must be a number!").catch(console.error);
            }
            eventSettings.messageReward = n1;
            break;
        case "messageCooldown":
            let n2 = Number(args[1]);
            if(isNaN(n2) || n2 == Infinity || n == -Infinity) {
                return message.channel.send("messageCooldown must be a number!").catch(console.error);
            }
            eventSettings.messageCooldown = n2;
            break;
        case "referrals":
            let s1 = args[1];
            let v1: boolean;
            if(s1 === "true") {
                v1 = true;
            } else if(s1 === "false") {
                v1 = false;
            } else {
                return message.channel.send("referrals must be either `true` or `false`").catch(console.error);
            }
            eventSettings.referrals = v1;
            break;
        case "referrerAmount":
            let n3 = Number(args[1]);
            if(isNaN(n3) || n3 == Infinity || n == -Infinity) {
                return message.channel.send("referrerAmount must be a number!").catch(console.error);
            }
            eventSettings.referrerAmount = n3;
            break;
        default:
            message.channel.send("That setting does not exist. Available settings are `prefix, defaultBalance, currency, watchMessages, messageReward, messageCooldown, referrals, referrerAmount`").catch(console.error);
            return;

    }
    try {
        await settings.save()
        await eventSettings.save();
        message.channel.send(`The value of \`${args[0]}\` has been set to \`${args[1]}\``).catch(console.error);
    } catch(e) {
        console.error(e);
        message.channel.send("There was an error saving your settings. Please report this as soon as possible.").catch(console.error);
    }*/
}

export const name = "settings";
export const category = HelpCategories.ADMIN;
export const help = "View and change the EconomyBot settings on your server.";