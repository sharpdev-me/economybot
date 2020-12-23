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

import { Message, Snowflake } from "discord.js";
import { getBalance } from "../../database";
import { GuildSettings } from "../../settings/settings";
import { HelpCategories } from "../misc/help_command";

const outstandingFlips: Coinflip[] = [];

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(!settings.enableGambling) {
        return message.channel.send("This server does not have gambling enabled.").catch(console.error);
    }

    if(args.length < 1) {
        let flipIndex = outstandingFlips.findIndex(element => element != undefined && element.target == message.author.id);
        if(flipIndex == -1) {
            return message.channel.send("Proper usage is `coinflip @<user> <amount>`").catch(console.error);
        }
        let flip = outstandingFlips[flipIndex];

        let winner = await doRandom([flip.issuer, flip.target], flip.amount, message.guild.id);
        outstandingFlips[flipIndex] = undefined;
        return message.channel.send(`The winner of this coinflip is: <@${winner}> for \`${flip.amount} ${settings.currency}\``).catch(console.error);
    }

    if(args.length < 2) {
        return message.channel.send("Proper usage is `coinflip @<user> <amount>`").catch(console.error);
    }

    if(message.mentions.members.size != 1) {
        return message.channel.send("Proper usage is `coinflip @<user> <amount>`").catch(console.error);
    }

    let flipIndex = outstandingFlips.findIndex(element => element != undefined && element.issuer == message.author.id);
    if(flipIndex != -1) {
        return message.channel.send("You already sent a coinflip request to somebody.").catch(console.error);
    }

    let amount = Number(args[1]);
    if(isNaN(amount) || amount == Infinity || amount == -Infinity) {
        return message.channel.send("The coinflip amount must be a number.").catch(console.error);
    }

    let balance = await getBalance(message.author.id, message.guild.id);
    if(balance.balance < amount) {
        return message.channel.send("You don't have enough money to create this coinflip.").catch(console.error);
    }

    outstandingFlips.push({
        amount: amount,
        issuer: message.author.id,
        target: message.mentions.members.first().id
    });

    setTimeout(() => {
        let flipIndex = outstandingFlips.findIndex(element => element != undefined && element.issuer == message.author.id);
        if(flipIndex != -1) {
            outstandingFlips[flipIndex] = undefined;
        }
    }, 1000 * 5)

    return message.channel.send(`A coinflip request for \`${args[1]} ${settings.currency}\` has been sent to <@${message.mentions.members.first()}>. This request will expire in \`5 minutes\``).catch(console.error);
}

async function doRandom(participants: Snowflake[], amount: number, guild: Snowflake): Promise<Snowflake> {
    let randomResult = Math.random() * 101;
    console.log(randomResult);
    let issuer = await getBalance(participants[0], guild);
    let target = await getBalance(participants[1], guild);
    if(randomResult < 50) {
        issuer.balance += amount;
        target.balance -= amount;
        return issuer.userID;
    } else if(randomResult > 50) {
        target.balance += amount;
        issuer.balance -= amount;
        return target.userID;
    } else {
        return doRandom(participants, amount, guild);
    }
}

export const name = "coinflip";
export const help = "Sends a request to a user to gamble some money in a coinflip";
export const category = HelpCategories.GAMBLING;

interface Coinflip {
    readonly issuer: Snowflake;
    readonly target: Snowflake;
    readonly amount: number;
}