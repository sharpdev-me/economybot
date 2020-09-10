import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    let current = new Date();
    message.channel.send("Pong!").catch(console.error).then((message: Message) => {
        let newDate = new Date();
        message.edit("Pong! `" + (newDate.getMilliseconds() - current.getMilliseconds()) + "ms`").catch(console.error);
    })
}

export const name = "ping";