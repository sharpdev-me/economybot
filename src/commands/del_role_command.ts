import { Message } from "discord.js";
import { delRole, getRole } from "../database";
import { GuildSettings } from "../settings/settings";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    if(settings.managers.findIndex((u) => {return u === message.author.id}) === -1 && message.author.id !== message.guild.ownerID) {
        return message.channel.send("You do not have permission to execute this command!").catch(console.error);
    }
    if(args.length < 1) {
        return message.channel.send("Proper usage is \`del_role <role>`").catch(console.error);
    }

    let roleName = args.join(" ");

    message.guild.roles.fetch().then(async roles => {
        let rolesFiltered = roles.cache.filter(role => role.name == roleName);
        if(rolesFiltered.size > 0) {
            let role = rolesFiltered.first();
            if(await getRole(role.id) == null) return message.channel.send("There were no roles with that name.").catch(console.error);
            await delRole(role.id).catch(console.error);
            message.channel.send(`You are no longer selling \`${role.name}\`.`);
        } else {
            return message.channel.send("There were no roles with that name.").catch(console.error);
        }
    }).catch(() => {
        message.channel.send("There was an error fetching roles from your server.").catch(console.error);
    });
}

export const name = "del_role";
export const aliases = ["dr", "delete_role"];
export const category = HelpCategories.ADMIN;
export const help = "Stop selling a role on your server";