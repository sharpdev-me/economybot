import { Message, MessageEmbed } from "discord.js";
import { GuildSettings, getBalances, getBalance } from "../database";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    const balances = await getBalances(message.guild.id);

    let amount: number = 10;

    if(args.length > 0) {
        amount = Math.min(Number(args[0]), 30);
        if(isNaN(amount)) {
            return message.channel.send("Amount must be a number!").catch(console.error);
        }
    }

    const yourPlace = balances.findIndex((value) => {
        return value.userID == message.author.id;
    });

    const embed = new MessageEmbed()
        .setColor(0xFFF700)
        .setFooter(`Your position: ${yourPlace + 1}`)
        .setTitle(`Top ${amount} Richest Players`);

    let value = "";

    if(amount >= balances.length) amount = balances.length;

    for(let i = 0; i < amount; i++) {
        const element = balances[i];
        const user = await message.client.users.fetch(element.userID);
        value += `${i + 1}. **${user.username}#${user.discriminator}**: ${element.balance} ${settings.currency}\n`;
    }

    embed.setDescription(value);
    message.channel.send(embed).catch(console.error);
}

export const name = "leaderboard";
export const aliases = ["leader", "top", "lb"];
export const category = HelpCategories.MONEY;
export const help = "Views the users with the most money on the server";