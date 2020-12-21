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
import { GuildSettings } from "../settings/settings";
import { getCommands } from "../discord_events";

export enum HelpCategories {
    NONE,
    ADMIN,
    MONEY,
    MISC,
    HIDE,
}

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    const commands = getCommands();

    let adminField = "";
    let moneyField = "";
    let miscField = "";

    for (const name in commands) {
        if (Object.prototype.hasOwnProperty.call(commands, name)) {
            const command = commands[name];
            if(command.name != name) continue;
            let category = command.category;
            let help = !command.help ? "No description provided" : command.help;
            if(!category) category = HelpCategories.MISC;
            switch(category) {
                case HelpCategories.MISC:
                    miscField += `\`${name}\` - ${help}\n`;
                    break;
                case HelpCategories.ADMIN:
                    adminField += `\`${name}\` - ${help}\n`;
                    break;
                case HelpCategories.MONEY:
                    moneyField += `\`${name}\` - ${help}\n`;
                    break;
                default:
                    continue;
            }
        }
    }

    const embed = new MessageEmbed()
            .setColor(0xFFF700)
            .setTitle("EconomyBot Help")
            .addField("Money Commands", moneyField + "---------------")
            .addField("Admin Commands", adminField + "---------------")
            .addField("Misc Commands", miscField   + "---------------");
    
    message.channel.send(embed).catch(console.error);
}

export const name = "help";
export const help = "Displays this help page";
export const category = HelpCategories.MISC;