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
import { getBalance } from "../../util/database";
import { GuildSettings } from "../../util/settings";
import { HelpCategories } from "../misc/help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.checkOthersBalance && message.mentions.members.size > 0) {
        const member = message.mentions.members.first();
        try {
            const balance = await getBalance(member.id, settings.id);
            message.channel.send(`${member.displayName}'s balance is \`${balance.balance} ${settings.currency}\``).catch(console.error);
        } catch(e) {
            console.error(e);
            message.channel.send("There was a problem fetching that user's balance.").catch(console.error);
        }
        return;
    }   
    const balance = await getBalance(message.author.id, settings.id);
    message.channel.send(`Your balance is \`${balance.balance} ${settings.currency}\``).catch(console.error);
}

export const name = "balance";
export const aliases = ["bal", "money"];
export const category = HelpCategories.MONEY;
export const help = "View your balance";