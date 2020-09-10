import { Message } from "discord.js";
import { GuildSettings, getBalance } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`set_balance <balance> [user1, user2...]`").catch(err => {
            console.error(err);
            message.channel.send("It seems there was an error processing your command! Please report this issue as soon as you can.").catch(console.error);
        });
    }
    const balance: number = Number(args[0]);
    if(isNaN(balance)) {
        return message.channel.send("Balance must be a number!").catch(console.error);
    }
    
    if(args.length == 1) {
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
    args.shift();
    for (const id of args) {
        const userBalance = await getBalance(id, message.guild.id);
        userBalance.balance = balance;
        userBalance.save().then(() => {
            message.channel.send("Those balances have been updated!").catch(console.error);
        }).catch(err => {
            console.error(err);
            message.channel.send("There was an issue saving those balances! Please report this issue as soon as you can.").catch(console.error);
        });
        return;
    }
}

export const name = "set_balance";
export const aliases = ["setbalances","sb"];