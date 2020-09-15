import { Message } from "discord.js";
import { getEventSettings, GuildSettings, saveEventSettings, saveGuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`settings <setting> [new value]\`").catch(console.error);
    }
    const setting = args[0];
    const eventSettings = await getEventSettings(settings.id);
    if(args.length == 1) {
        let result = "";
        switch(setting) {
            case "prefix":
                result = settings.prefix;
                break;
            case "defaultBalance":
                result = "" + settings.defaultBalance;
                break;
            case "currency":
                result = settings.currency;
                break;
            case "watchMessages":
                result = eventSettings.watchMessages ? "true" : "false";
                break;
            case "messageReward":
                result = eventSettings.messageReward + "";
                break;
            case "messageCooldown":
                result = eventSettings.messageCooldown + "";
                break;
            case "watchInvites":
                result = eventSettings.watchInvites ? "true" : "false";
                break;
            case "inviteReward":
                result = eventSettings.inviteReward + "";
                break;
            default:
                message.channel.send("That setting does not exist. Available settings are `prefix, defaultBalance, currency, watchMessages, messageReward, messageCooldown, watchInvites, inviteReward`").catch(console.error);
                return;
        }
        message.channel.send(`The value for \`${setting}\` is \`${result}\``).catch(console.error);
    } else if(args.length > 1) {
        switch(setting) {
            case "prefix":
                settings.prefix = args[1];
                break;
            case "defaultBalance":
                let n = Number(args[1]);
                if(isNaN(n)) {
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
                if(isNaN(n1)) {
                    return message.channel.send("messageReward must be a number!").catch(console.error);
                }
                eventSettings.messageReward = n1;
                break;
            case "messageCooldown":
                let n2 = Number(args[1]);
                if(isNaN(n2)) {
                    return message.channel.send("messageCooldown must be a number!").catch(console.error);
                }
                eventSettings.messageCooldown = n2;
                break;
            case "watchInvites":
                let s1 = args[1];
                let v1: boolean;
                if(s1 === "true") {
                    v1 = true;
                } else if(s1 === "false") {
                    v1 = false;
                } else {
                    return message.channel.send("watchInvites must be either `true` or `false`").catch(console.error);
                }
                eventSettings.watchInvites = v1;
                break;
            case "inviteReward":
                let n3 = Number(args[1]);
                if(isNaN(n3)) {
                    return message.channel.send("inviteReward must be a number!").catch(console.error);
                }
                eventSettings.inviteReward = n3;
                break;
            default:
                message.channel.send("That setting does not exist. Available settings are `prefix, defaultBalance, currency, watchMessages, messageReward, messageCooldown, watchInvites, inviteReward`").catch(console.error);
                return;

        }
        saveGuildSettings(settings).catch((err) => {
            message.channel.send("There was an error saving your settings!").catch(console.error);
            console.error(err);
        }).then(() => {
            saveEventSettings(eventSettings).catch((e) => {
                message.channel.send("There was an error saving your settings!").catch(console.error);
                console.error(e);
            }).then(() => {
                message.channel.send(`The value of \`${args[0]}\` has been set to \`${args[1]}\``).catch(console.error);
            });
        })
    }
}

export const name = "settings";