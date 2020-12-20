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
        return message.channel.send("You must mention one or more managers to remove.").catch(console.error);
    }

    let currentManagers = settings.managers;

    message.mentions.members.forEach(member => {
        let index = currentManagers.findIndex((mem) => {return mem == member.id});
        if(index === -1) {
            message.channel.send(`${member.user.username}#${member.user.discriminator} is not a manager of your server!`).catch(console.error);
        } else {
            currentManagers.splice(index, 1);
        }
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

export const name = "delmanager";
export const category = HelpCategories.ADMIN;
export const help = "Removes a manager from your server";