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
import { getRoles } from "../../util/database";
import { GuildSettings } from "../../util/settings";
import { HelpCategories } from "../misc/help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    let roles = await getRoles(message.guild.id);

    const embed = new MessageEmbed()
        .setColor(0xFFF700)
        .setFooter("Run 'buy_role <name>' to purchase a role")
        .setTitle(`Roles available to purchase`);

    let value = "";


    for(let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const discordRole = await message.guild.roles.fetch(role.id);
        const priceString = role.cost == 0 ? "FREE" : `${role.cost} ${settings.currency}`;
        value += `\`${discordRole.name}\` for \`${priceString}\`\n`;
    }

    embed.setDescription(value);
    message.channel.send(embed).catch(console.error);
}

export const name = "roles";
export const category = HelpCategories.MONEY;
export const help = "View a list of all roles this server is selling. You can purchase a role with the `buy_role` command.";