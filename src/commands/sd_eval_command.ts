import * as Discord from "discord.js";
import * as database from "../database";
import * as cache from "../cache";
import { HelpCategories } from "./help_command";
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