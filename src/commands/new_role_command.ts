import { Message } from "discord.js";
import { GuildSettings, addRole } from "../database";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 2) {
        return message.channel.send("Proper usage is \`new_role <cost> <role>`").catch(console.error);
    }

    let cost = Number(args[0]);
    if(isNaN(cost) || cost == Infinity || cost == -Infinity) return message.channel.send("Cost must be a number.").catch(console.error);
    
    let roleName = args.slice(1).join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            await addRole({cost: cost, guild: message.guild.id, id: role.id}).catch(console.error);
            message.channel.send(`You are now selling \`${role.name}\` for ${cost} ${settings.currency}!`);
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "new_role";
export const aliases = ["nr", "add_role", "create_role"];
export const category = HelpCategories.ADMIN;
export const help = "Start selling a role on your server. This will allow users to purchase them with the `buy_role` command.";