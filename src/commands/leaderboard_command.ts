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

import { Message, MessageEmbed } from "discord.js";
import { getBalances, getBalance } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    const balances = await getBalances(message.guild.id);

    let amount: number = 10;

    if(args.length > 0) {
        amount = Math.min(Number(args[0]), 30);
        if(isNaN(amount)) {
            return message.channel.send("Amount must be a number!").catch(console.error);
        }
    }

    const yourPlace = balances.findIndex((value) => {
        return value.userID == message.author.id;
    });

    const embed = new MessageEmbed()
        .setColor(0xFFF700)
        .setFooter(`Your position: ${yourPlace + 1}`)
        .setTitle(`Top ${amount} Richest Players`);

    let value = "";

    if(amount >= balances.length) amount = balances.length;

    for(let i = 0; i < amount; i++) {
        const element = balances[i];
        const user = await message.client.users.fetch(element.userID);
        value += `${i + 1}. **${user.username}#${user.discriminator}**: ${element.balance} ${settings.currency}\n`;
    }

    embed.setDescription(value);
    message.channel.send(embed).catch(console.error);
}

export const name = "leaderboard";
export const aliases = ["leader", "top", "lb"];
export const category = HelpCategories.MONEY;
export const help = "Views the users with the most money on the server";