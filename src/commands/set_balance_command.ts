import { Message } from "discord.js";
import { GuildSettings, getBalance } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`set_balance <balance> [user1, user2...]`").catch(console.error);
    }
    const balance: number = Number(args[0]);
    if(isNaN(balance)) {
        return message.channel.send("Balance must be a number!").catch(console.error);
    }
    
    if(message.mentions.members.size < 1) {
        const userBalance = await getBalance(message.author.id, message.guild.id);
        userBalance.balance = balance;
        userBalance.save().then(() => {
            message.channel.send("Your balance has been updated!").catch(console.error);
        }).catch(err => {
            console.error(err);
            message.channel.send("There was an issue saving your balance! Please report this issue as soon as you can.").catch(console.error);
        });
        return;
    }
    let error = false;
    message.mentions.members.forEach(async member => {
        const userBalance = await getBalance(member.id, message.guild.id);
        userBalance.balance = balance;
        userBalance.save().catch(err => {
            console.error(err);
            error = true;
        });
        return;
    })
    if(error) {
        return message.channel.send("There was an issue saving those balances! Please report this issue as soon as you can.").catch(console.error);
    }
    message.channel.send("Those balance(s) have been updated!").catch(console.error);
}

export const name = "set_balance";
export const aliases = ["setbalances","sb", "set_balances", "setbalance"];