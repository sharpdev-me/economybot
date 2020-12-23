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

import { DMChannel, Message } from "discord.js";
import { newToken, removeToken } from "../../database";
import { GuildSettings } from "../../settings/settings";
import { HelpCategories } from "../misc/help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is `del_token <token name>`").catch(console.error);
    }

    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }

    let name = args.join(" ");

    await removeToken(message.guild.id, name);
    message.channel.send("That token has been successfully deleted.").catch(console.error);
}

export const name = "del_token";
export const category = HelpCategories.ADMIN;
export const help = "Remove an API token from your server";