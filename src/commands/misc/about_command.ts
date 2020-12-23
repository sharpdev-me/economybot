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
import { GuildSettings } from "../../settings/settings";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.channel.send("EconomyBot was created by one person (SharpDev#1011) because he was tired of seeing different points systems and server economies.\n"
        + "If you just use these bots, you can help EconomyBot achieve its purpose by telling bot developers about me.\n"
        + "If you're a bot developer, you can go to https://economybot.xyz/docs/ to learn how to include me in your projects!").catch(console.error);    
}

export const name = "about";
export const help = "Get some information about the bot's development.";