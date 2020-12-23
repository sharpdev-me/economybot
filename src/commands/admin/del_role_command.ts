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
import { delRole, getRole } from "../../database";
import { GuildSettings } from "../../settings/settings";
import { HelpCategories } from "../misc/help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`del_role <role>`").catch(console.error);
    }

    let roleName = args.join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            if(await getRole(role.id) == null) return message.channel.send("There were no roles with that name.").catch(console.error);
            await delRole(role.id).catch(console.error);
            message.channel.send(`You are no longer selling \`${role.name}\`.`);
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "del_role";
export const aliases = ["dr", "delete_role"];
export const category = HelpCategories.ADMIN;
export const help = "Stop selling a role on your server";