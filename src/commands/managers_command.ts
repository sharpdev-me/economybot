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
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    let owner = message.guild.owner;
    let s = "The managers of this server are:\n" + `\`${owner.displayName} (${owner.user.username}#${owner.user.discriminator})\`` + "\n";
    for await (const manager of settings.managers.map(async v => await message.guild.members.fetch(v))) {
        s += `\`${manager.displayName} (${manager.user.username}#${manager.user.discriminator})\`\n`;
    }
    message.channel.send(s).catch(console.error);
}

export const name = "managers";
export const category = HelpCategories.ADMIN;
export const help = "List all managers on this server";