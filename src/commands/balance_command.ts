import { Message } from "discord.js";
import { GuildSettings, getBalance } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    const balance = await getBalance(message.author.id, message.guild.id);
    message.channel.send(`Your balance is \`${balance.balance} ${settings.currency}\``).catch(console.error);
}

export const name = "balance";
export const aliases = ["bal", "money"];