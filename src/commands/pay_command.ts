import { Message } from "discord.js";
import { getBalance } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(args.length < 2) {
        return message.channel.send("Proper usage is `pay <mentioned user> <amount>`").catch(console.error);
    }

    if(message.mentions.members.size < 1) {
        return message.channel.send("You must mention somebody to send your money to!").catch(console.error);
    }
    let recipient = message.mentions.members.first();
    if(recipient.id == message.author.id) {
        return message.channel.send("You can't send money to yourself, silly!").catch(console.error);
    }
    let amount = Math.round(Number(args[1]));

    if(isNaN(amount) || amount == Infinity || amount == -Infinity) {
        return message.channel.send("The amount to pay must be a number!").catch(console.error);
    }

    let recipientBalance = await getBalance(recipient.id, settings.id);
    let issuerBalance = await getBalance(message.author.id, settings.id);

    if(amount > issuerBalance.balance) {
        return message.channel.send(`You need an additional ${amount - issuerBalance.balance} ${settings.currency} to make this transaction.`).catch(console.error);
    }

    recipientBalance.balance += amount;
    issuerBalance.balance -= amount;

    try {
        await recipientBalance.save();
        await issuerBalance.save();
        
        message.channel.send(`You have successfully sent \`${amount} ${settings.currency}\` to <@${recipient.id}>`);
    } catch(e) {
        console.error(e);
    }
}

export const name = "pay";
export const category = HelpCategories.MONEY;
export const help = "Send another user some of your own money";