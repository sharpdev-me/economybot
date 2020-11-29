import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.author.createDM().catch().then(dm => {
        dm.send("EconomyBot was created by one person (SharpDev#1011) because he was tired of seeing different points systems and server economies.\n"
        + "If you just use these bots, you can help EconomyBot achieve its purpose by telling bot developers about it.\n"
        + "If you're a bot developer, you can go to https://economybot.xyz/docs/ to learn how to include it in your projects!").catch();
    });
}

export const name = "about";