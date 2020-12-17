import { DMChannel, Message, MessageEmbed } from "discord.js";
import { GuildSettings, listTokens } from "../database";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }

    const tokens = await listTokens(message.guild.id);

    if(tokens.length < 1) {
        return message.channel.send("This server has no API tokens. Create one with \`new_token <token name>\`").catch(console.error);
    }
    
    const embed = new MessageEmbed()
    .setTitle("API Tokens")
    .setColor(0xffed21);

    let names = "";
    let issuers = "";
    for (const token of tokens) {
        names += token.name + "\n";
        issuers += (await message.guild.members.fetch(token.issuer)).displayName + "\n";
    }
    embed.addField("Name", names, true);
    embed.addField("Issued By", issuers, true);
    message.author.createDM().catch((e) => {
        console.error(e);
        message.channel.send("There was a problem sending you a DM with this server's tokens. Make sure you can receive messages from EconomyBot").catch(console.error);
    }).then((dm: DMChannel) => {
        dm.send(embed).catch(console.error).then(() => {
            message.channel.send("I have sent you a DM listing this server's API tokens.").catch(console.error);
        });
    });
}

export const name = "list_tokens";
export const category = HelpCategories.ADMIN;
export const help = "Lists this server's API tokens";