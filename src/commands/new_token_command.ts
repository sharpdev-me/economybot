import { DMChannel, Message } from "discord.js";
import { GuildSettings, newToken } from "../database";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is `new_token <token name>`").catch(console.error);
    }

    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }

    let name = args.join(" ");

    let token = await newToken(message.guild.id, message.author.id, name);
    message.author.createDM().catch((error) => {
        console.error(error);
        return message.channel.send("There was an issue sending the token to your DM's! Make sure you can accept messages from EconomyBot.").catch(console.error);
    }).then((dm: DMChannel) => {
        dm.send(`The token for \`${token.name}\` is \`${token.token}\`.`).catch(console.error).then(() => {
            message.channel.send("The API token has been sent to you in a private message.").catch(console.error);
        });
    })
}

export const name = "new_token";
export const category = HelpCategories.ADMIN;
export const help = "Creates a new API token for this server. If you want to know how to use this, go to https://economybot.xyz/docs/";