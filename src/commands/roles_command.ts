import { Message, MessageEmbed } from "discord.js";
import { getRoles, GuildSettings } from "../database";
import { HelpCategories } from "./help_command";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) {
        return message.channel.send("This command can only be run in a server!").catch(console.error);
    }
    let roles = await getRoles(message.guild.id);

    const embed = new MessageEmbed()
        .setColor(0xFFF700)
        .setFooter("Run 'buy_role <name>' to purchase a role")
        .setTitle(`Roles available to purchase`);

    let value = "";


    for(let i = 0; i < roles.length; i++) {
        const role = roles[i];
        const discordRole = await message.guild.roles.fetch(role.id);
        value += `\`${discordRole.name}\` for \`${role.cost}\` ${settings.currency}\n`;
    }

    embed.setDescription(value);
    message.channel.send(embed).catch(console.error);
}

export const name = "roles";
export const category = HelpCategories.MONEY;
export const help = "View a list of all roles this server is selling. You can purchase a role with the `buy_role` command.";