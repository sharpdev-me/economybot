import { DMChannel, Message } from "discord.js";
import { GuildSettings, newToken, removeToken } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is `del_token <token name>`").catch(console.error);
    }

    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }

    let name = args.join(" ");

    await removeToken(message.guild.id, name);
    message.channel.send("That token has been successfully deleted.").catch(console.error);
}

export const name = "del_token";