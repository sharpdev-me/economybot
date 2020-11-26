import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.channel.send("Head to https://economybot.xyz/ to invite me to your server!").catch(console.error);
}

export const name = "invite";
export const aliases = ["inv", "addme"];