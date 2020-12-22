import { ApplicationCommandInteractionData, ApplicationCommandOption, ApplicationCommandOptionType, DiscordInteractions, GuildMember, Interaction, InteractionResponse, InteractionResponseType, PartialApplicationCommand } from "slash-commands";
import * as fs from "fs/promises";
import { resolve } from "path";
import {Express} from "express";
import { GuildSettings } from "../settings/settings";

const PUBLIC_KEY = process.env.ECONOMY_PUBLIC_KEY;

const interaction = new DiscordInteractions({
    applicationId: process.env.ECONOMY_CLIENT,
    publicKey: PUBLIC_KEY,
    authToken: process.env.ECONOMY_TOKEN
});

export const slash_commands: {[key: string]: SlashCommand} = {};

export async function begin_handling(expressApp: Express) {
    try {
        expressApp.get("/interaction", (req, res) => {
            const signature = req.get("X-Signature-Ed25519");
            const timestamp = req.get("X-Signature-Timestamp");
            let data = "";
            req.setEncoding("utf-8")
            req.on("data", function(chunk) {
                data += chunk;
            });
            req.on("end", async function() {
                if(!await interaction.verifySignature(signature, timestamp, data)) {
                    return res.status(401).send("invalid request signature");
                }
                if(req.body.type == 1) {
                    return res.status(200).send({type:1});
                }
                let response: InteractionResponse = {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        tts: false,
                        content: "Nice-u!"
                    }
                };
                return res.status(200).send(response);
            });
        });
        let current_slash_commands = await interaction.getApplicationCommands();
        let slash_commands_dir = await fs.readdir(__dirname);
        for (const slash_command_file of slash_commands_dir) {
            if(slash_command_file.endsWith("_slash.js")) {
                const slash_command = require(resolve(__dirname, slash_command_file)) as SlashCommand;
                slash_commands[slash_command.name] = slash_command;
                if(current_slash_commands.find(command => command.name == slash_command.name && command.options == slash_command.options) == undefined) {
                    console.log("Registering new slash command " + slash_command.name);
                    let command: PartialApplicationCommand = {
                        description: slash_command.description,
                        name: slash_command.name,
                    }
                    if(slash_command.options) {
                        command.options = slash_command.options;
                    }
                    interaction.createApplicationCommand(command);
                }
            }
        }
    } catch(error) {
        console.error(error);
    }
}

export interface SlashCommand {
    readonly name: string;
    readonly description: string;
    readonly options?: ApplicationCommandOption[];
    readonly run: (member: GuildMember, data: ApplicationCommandInteractionData, settings: GuildSettings, interaction: Interaction) => Promise<void>;
}