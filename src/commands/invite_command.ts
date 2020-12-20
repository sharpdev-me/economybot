import { Message } from "discord.js";
import { GuildSettings } from "../settings/settings";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.channel.send("Head to https://economybot.xyz/ to invite me to your server!").catch(console.error);
}

export const name = "invite";
export const aliases = ["inv", "addme"];
export const help = "Get an invite link for EconomyBot";