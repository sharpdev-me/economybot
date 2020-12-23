/* EconomyBot - A unifying economy API
 * Copyright (C) 2020 Skyler Morgan <sharpdev@sharpdev.me>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import DiscordInteractions, { ApplicationCommandInteractionData, ApplicationCommandOption, GuildMember, Interaction, InteractionApplicationCommandCallbackData, InteractionResponse } from "slash-commands";
import { Express } from "express";
import * as fs from "fs/promises";
import { resolve } from "path";
import { GuildSettings } from "../settings/settings";

import { verifyKeyMiddleware } from "discord-interactions";
import { getGuildSettings } from "../database";

export const slash_commands: {[key: string]: SlashCommand} = {};

const interaction = new DiscordInteractions({
    applicationId: process.env.ECONOMY_CLIENT,
    authToken: process.env.ECONOMY_TOKEN,
    publicKey: process.env.ECONOMY_PUBLIC_KEY
});

export async function beginHandling(express: Express) {
    const commandPath = resolve(__dirname, "commands/");
    const existingCommands = await interaction.getApplicationCommands();
    // Perhaps not the most efficient way to do this, but it gets the job done
    existingCommands.forEach(existingCommand => {
        interaction.deleteApplicationCommand(existingCommand.id);
    })
    let files = await fs.readdir(commandPath);
    for (const fileName of files) {
        let file = resolve(commandPath, fileName);

        const slash_command = require(file) as SlashCommand;

        slash_commands[(await interaction.createApplicationCommand(slash_command)).name] = slash_command;
    }
    const toRemove = existingCommands.filter(element => slash_commands[element.name] == null);
    for (const removing of toRemove) {
        interaction.deleteApplicationCommand(removing.id)
    }
    express.post("/interactions", verifyKeyMiddleware(process.env.ECONOMY_PUBLIC_KEY), async (req, res) => {
        const body = req.body;
        if(slash_commands[body.data.name] == undefined) return;
        const result = await slash_commands[body.data.name].run(body.data, body.member, await getGuildSettings(body.guild_id), body);
        res.status(200).send(result);
    });
}

export interface SlashCommand {
    readonly name: string;
    readonly description: string;
    readonly options?: ApplicationCommandOption[];

    readonly run: (data: ApplicationCommandInteractionData, member: GuildMember, settings: GuildSettings, interaction: Interaction) => Promise<InteractionResponse>;
}