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
    if(args.length < 2) {
        return message.channel.send("Proper usage is `pay <mentioned user> <amount>`").catch(console.error);
    }

    if(message.mentions.members.size < 1) {
        return message.channel.send("You must mention somebody to send your money to!").catch(console.error);
    }
    let recipient = message.mentions.members.first();
    if(recipient.id == message.author.id) {
        return message.channel.send("You can't send money to yourself, silly!").catch(console.error);
    }
    let amount = Math.round(Number(args[1]));

    if(isNaN(amount) || amount == Infinity || amount == -Infinity) {
        return message.channel.send("The amount to pay must be a number!").catch(console.error);
    }

    let recipientBalance = await getBalance(recipient.id, settings.id);
    let issuerBalance = await getBalance(message.author.id, settings.id);

    if(amount > issuerBalance.balance) {
        return message.channel.send(`You need an additional ${amount - issuerBalance.balance} ${settings.currency} to make this transaction.`).catch(console.error);
    }

    recipientBalance.balance += amount;
    issuerBalance.balance -= amount;

    try {
        await recipientBalance.save();
        await issuerBalance.save();
        
        message.channel.send(`You have successfully sent \`${amount} ${settings.currency}\` to <@${recipient.id}>`);
    } catch(e) {
        console.error(e);
    }
}

export const name = "pay";
export const category = HelpCategories.MONEY;
export const help = "Send another user some of your own money";