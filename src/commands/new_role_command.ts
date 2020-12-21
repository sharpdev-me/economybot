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
import { addRole } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 2) {
        return message.channel.send("Proper usage is \`new_role <cost> <role>`").catch(console.error);
    }

    let cost = Number(args[0]);
    if(isNaN(cost) || cost == Infinity || cost == -Infinity) return message.channel.send("Cost must be a number.").catch(console.error);
    
    let roleName = args.slice(1).join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            await addRole({cost: cost, guild: message.guild.id, id: role.id}).catch(console.error);
            message.channel.send(`You are now selling \`${role.name}\` for ${cost} ${settings.currency}!`);
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "new_role";
export const aliases = ["nr", "add_role", "create_role"];
export const category = HelpCategories.ADMIN;
export const help = "Start selling a role on your server. This will allow users to purchase them with the `buy_role` command.";