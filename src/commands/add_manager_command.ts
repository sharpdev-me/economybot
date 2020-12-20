import { Message } from "discord.js";
import { GuildSettings, saveGuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command.").catch(console.error);
    }
    if(message.mentions.members.size < 1) {
        return message.channel.send("You must mention one or more members to make a manager!").catch(console.error);
    }

    let currentManagers = settings.managers;

    message.mentions.members.forEach(member => {
        currentManagers.push(member.id);
    });

    settings.managers = currentManagers;
    try {
        await saveGuildSettings(settings);
        message.channel.send("You have updated your server's managers successfully!").catch(console.error);
    } catch(e) {
        console.error(e);
        message.channel.send("There was a problem upating your server's settings. Please report this as soon as possible.").catch(console.error);
    }
}

export const name = "addmanager";
export const aliases = ["add_manager"];
export const category = HelpCategories.ADMIN;
export const help = "Add a manager to your server. This will allow them to change some settings and users balances.";