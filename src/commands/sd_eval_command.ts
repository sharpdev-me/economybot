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

import * as Discord from "discord.js";
import * as database from "../database";
import * as cache from "../cache";
import { HelpCategories } from "./misc/help_command";
import { GuildSettings } from "../settings/settings";

cache.exists("a");
database.getClient();

export async function run(args: string[], message: Discord.Message, settings?: GuildSettings) {
    let startDate = Date.now();
    let res = "";
    try {
        eval("function result(obj) { res += obj.toString() + '\\n'; } " + args.join(" "));
    } catch(e) {
        if(e == null || e == "") e = "no error?";
        console.log(e);
        (await message.author.createDM()).send(e);
        return message.channel.send("Error");
    }
    
    const embed = new Discord.MessageEmbed()
        .setColor(0xFFF700)
        .setFooter(`Execution Time: ${Date.now() - startDate} ms`);

    if(res === "") {
        res = "No result.";
    }
    embed.addField("Log Result", res, true);
    console.log(`Eval result: ${res}`);
    message.channel.send(embed);
}

export const name = "sd_eval";
export const category = HelpCategories.HIDE;