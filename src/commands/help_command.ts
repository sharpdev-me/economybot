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