import { Message } from "discord.js";
import { GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    let owner = message.guild.owner;
    let s = "The managers of this server are:\n" + `\`${owner.displayName} (${owner.user.username}#${owner.user.discriminator})\`` + "\n";
    for await (const manager of settings.managers.map(async v => await message.guild.members.fetch(v))) {
        s += `\`${manager.displayName} (${manager.user.username}#${manager.user.discriminator})\`\n`;
    }
    message.channel.send(s).catch(console.error);
}

export const name = "managers";