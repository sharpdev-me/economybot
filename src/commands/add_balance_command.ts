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
import { getBalance } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`add_balance <balance> [user1, user2...]`").catch(console.error);
    }
    const balance: number = Number(args[0]);
    if(isNaN(balance) || balance == Infinity || balance == -Infinity) {
        return message.channel.send("Balance must be a number!").catch(console.error);
    }
    
    if(message.mentions.members.size < 1) {
        const userBalance = await getBalance(message.author.id, message.guild.id);
        userBalance.balance -= balance;
        userBalance.save().then(() => {
            message.channel.send("Your balance has been updated!").catch(console.error);
        }).catch(err => {
            console.error(err);
            message.channel.send("There was an issue saving your balance! Please report this issue as soon as you can.").catch(console.error);
        });
        return;
    }
    let error = false;
    message.mentions.members.forEach(async member => {
        const userBalance = await getBalance(member.id, message.guild.id);
        userBalance.balance -= balance;
        userBalance.save().catch(err => {
            console.error(err);
            error = true;
        });
        return;
    })
    if(error) {
        return message.channel.send("There was an issue saving those balances! Please report this issue as soon as you can.").catch(console.error);
    }
    message.channel.send("Those balance(s) have been updated!").catch(console.error);
}

export const name = "add_balance";
export const aliases = ["addbalances","ab", "add_balances", "addbalance"];
export const category = HelpCategories.ADMIN;
export const help = "Give user(s) money";