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
import { GuildSettings, saveGuildSettings, settingsDescriptions, settingsPermissions } from "../../util/settings";
import { HelpCategories } from "../misc/help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        // For future: allow users to change whether or not others can view their balances
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    let settingsAny: any = settings;
    if(args.length < 1) {
        const embed = new MessageEmbed()
            .setColor(0xFFF700)
            .setFooter("Run `settings <setting> <value>` to change a value.")
            .setTitle("Server Settings")
            .setThumbnail(message.guild.iconURL());
        let value = "";
        
        let descriptionsAny: any = settingsDescriptions;
        for (const settings_key in settingsAny) {
            if (Object.prototype.hasOwnProperty.call(settings, settings_key)) {
                if(Object.prototype.hasOwnProperty.call(settingsDescriptions, settings_key)) {
                    const settings_description = descriptionsAny[settings_key];
                    value += `\`${settings_key}\`: ${settingsAny[settings_key]} - ${settings_description}\n`;
                }
            }
        }
        

        embed.setDescription(value);

        return message.channel.send(embed).catch(console.error);
    }
    if(args.length < 2) {
        return message.channel.send("Proper usage is `settings [<setting> <value>]`").catch(console.error);
    }
    const setting = args[0];
    if(settingsPermissions[setting] && !message.guild.me.hasPermission(settingsPermissions[setting])) return message.channel.send(`This setting requires the bot to have the \`${settingsPermissions[setting]}\` permission.`).catch(console.error);
    if(Object.prototype.hasOwnProperty.call(settings, setting)) {
        if(verifyInput(args[1], typeof settingsAny[setting])) {
            settingsAny[setting] = typeInput(args[1], typeof settingsAny[setting]);
        } else {
            return message.channel.send(`The setting \`${setting}\` must be a \`${typeof settingsAny[setting]}\``).catch(console.error);
        }
    } else {
        return message.channel.send("That setting does not exist. Run the `settings` command to view a full list.").catch(console.error);
    }
    try {
        settings = settingsAny;
        await saveGuildSettings(settings);
        message.channel.send(`The value of \`${args[0]}\` has been set to \`${args[1]}\``).catch(console.error);
    } catch(e) {
        console.error(e);
        message.channel.send("There was an error saving your settings. Please report this as soon as possible.").catch(console.error);
    }
}

function verifyInput(input: string, type: string): boolean {
    if(type == "string") {
        return input.length < 32;
    } else if(type == "number") {
        let inputAsNum: number = Number(input);
        return !(isNaN(inputAsNum) || inputAsNum == Infinity || inputAsNum == -Infinity);
    } else if(type == "boolean") {
        return (input == "true" || input == "false");
    }
    return false;
}

function typeInput(input: string, type: string) {
    if(type == "string") {
        return input;
    } else if(type == "number") {
        return Number(input);
    } else if(type == "boolean") {
        return Boolean(input);
    }
}

export const name = "settings";
export const category = HelpCategories.ADMIN;
export const help = "View and change the EconomyBot settings on your server.";