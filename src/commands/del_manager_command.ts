import { Message } from "discord.js";
import { GuildSettings, saveGuildSettings } from "../database";

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
    saveGuildSettings(settings).then(() => {
        message.channel.send("You have successfully updated your server's managers!").catch(console.error);
    }).catch((e) => {
        message.channel.send("There was a problem updating your server's settings. Please report this as soon as possible.").catch(console.error);
        return console.error(e);
    });
}

export const name = "delmanager";