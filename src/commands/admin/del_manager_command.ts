/* EconomyBot - A unifying economy API
 * Copyright (C) 2020 Skyler Morgan <sharpdev@sharpdev.me>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Message } from "discord.js";
import { GuildSettings, saveGuildSettings } from "../../settings/settings";
import { HelpCategories } from "../misc/help_command";

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