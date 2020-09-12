import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    let s = "The managers of this server are:\n" + message.guild.owner.displayName + "\n";
    for await (const manager of settings.managers.map(async v => await message.guild.members.fetch(v))) {
        s += manager.displayName + "\n";
    }
    message.channel.send(s).catch(console.error);
}

export const name = "managers";