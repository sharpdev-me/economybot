import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.channel.send("Pong!").catch(console.error);
}

export const name = "ping";
export const help = "Pings the bot";