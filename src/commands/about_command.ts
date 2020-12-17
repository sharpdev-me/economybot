import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    message.author.createDM().then(dm => {
        dm.send("EconomyBot was created by one person (SharpDev#1011) because he was tired of seeing different points systems and server economies.\n"
        + "If you just use these bots, you can help EconomyBot achieve its purpose by telling bot developers about me.\n"
        + "If you're a bot developer, you can go to https://economybot.xyz/docs/ to learn how to include me in your projects!").catch(console.error);
    }).catch(() => {
        message.channel.send("I wasn't able to send you a direct message. Make sure you allow me to do so in your settings.").catch(console.error)
    });
}

export const name = "about";
export const help = "Get some information about the bot's development.";