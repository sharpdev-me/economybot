import { Message, MessageEmbed } from "discord.js";
import { getRoles, GuildSettings } from "../database";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
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