import { Message } from "discord.js";
import { GuildSettings, getRole, getBalance } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(args.length < 1) {
        return message.channel.send("Proper usage is `buy_role <role>`").catch(console.error);
    }

    let roleName = args.join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            let managedRole = await getRole(role.id);
            if(managedRole == null) return message.channel.send("There were no roles with that name.").catch(console.error);

            if(message.member.roles.cache.find(r => r.id == role.id)) return message.channel.send("You already have that role.").catch(console.error);
            
            let balance = await getBalance(message.author.id, message.guild.id);

            if(balance.balance >= managedRole.cost) {
                balance.balance -= managedRole.cost;
                try {
                    await message.member.roles.add(role);
                    await balance.save();
                    message.channel.send("You have successfully purchased " + role.name + "!").catch(console.error);
                } catch(e) {
                    message.channel.send("There was an error purchasing this role.").catch(console.error);
                    console.error(e);
                }
            } else {
                return message.channel.send(`You do not have enough ${settings.currency} to purchase this role.`).catch(console.error);
            }
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "buy_role";
export const aliases = ["br"];