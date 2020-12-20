import { Message } from "discord.js";
import { getBalance } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    const balance = await getBalance(message.author.id, message.guild.id);
    message.channel.send(`Your balance is \`${balance.balance} ${settings.currency}\``).catch(console.error);
}

export const name = "balance";
export const aliases = ["bal", "money"];
export const category = HelpCategories.MONEY;
export const help = "View your balance";