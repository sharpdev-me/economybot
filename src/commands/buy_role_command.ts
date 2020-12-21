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
import { getRole, getBalance } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is `buy_role <role>`").catch(console.error);
    }

    let roleName = args.join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            let managedRole = await getRole(role.id);
            if(managedRole == null) return message.channel.send("There were no roles with that name.").catch(console.error);

            if(message.member.roles.cache.find(r => r.id == role.id)) return message.channel.send("You already have that role.").catch(console.error);
            
            let balance = await getBalance(message.author.id, message.guild.id);

            if(balance.balance >= managedRole.cost) {
                balance.balance -= managedRole.cost;
                try {
                    await message.member.roles.add(role);
                    await balance.save();
                    message.channel.send("You have successfully purchased " + role.name + "!").catch(console.error);
                } catch(e) {
                    message.channel.send("There was an error purchasing this role.").catch(console.error);
                    console.error(e);
                }
            } else {
                return message.channel.send(`You do not have enough ${settings.currency} to purchase this role.`).catch(console.error);
            }
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "buy_role";
export const aliases = ["br"];
export const category = HelpCategories.MONEY;
export const help = "Buys a role from one of the server's available roles, check with the `roles` command.";