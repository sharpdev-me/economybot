import {Client, Guild, Message, DMChannel, NewsChannel, TextChannel} from "discord.js";

import { readdir } from "fs";
import { resolve } from "path";

import * as database from "./database";

export const commands: any = {};

export async function register_events(client: Client) {
    readdir(resolve(__dirname, "./commands"), async (err, files) => {
        if(err) return console.error(err);
        for (const file of files) {
            const filePath = resolve(__dirname, "./commands/", file);
            const props = require(filePath);
            if(props.aliases) {
                for (let i = 0; i < props.aliases.length; i++) {
                    const alias = props.aliases[i];
                    commands[alias] = props;
                }
            }
            commands[props.name] = props;
        }

        client.on("ready", async () => {
            console.log("Bot Online");
            console.log(`Guilds: ${client.guilds.cache.size}\nUsers: ${client.users.cache.size}`);
        });

        client.on("message", async (message: Message) => {
            if(message.author.bot) return;
            if(message.channel instanceof NewsChannel) return;
            if(message.channel instanceof DMChannel) {
                if(!message.content.startsWith("$")) return;
                // Handle command sent to the bot via DMs6
                const split = splitMessage(message, "$");
                const cmd = commands[split[1]];
                if(!cmd) return;
                cmd.run(split[0], message);
            } else if(message.channel instanceof TextChannel) {
                // Fetch GuildSettings
                database.getGuildSettings(message.channel.id).catch(console.error).then((guildSettings: database.GuildSettings) => {
                    if(!message.content.startsWith(guildSettings.prefix)) return;
                    const split = splitMessage(message, guildSettings.prefix);
                    const cmd = commands[split[1]];
                    if(!cmd) return;
                    cmd.run(split[0], message, guildSettings);
                });
            }
        });
    });
}

function splitMessage(message: Message, prefix: string): [string[], string] {
    const content = message.content;
    const args = content.slice(prefix.length).trim().split(/ +/g);
    return [args, args.shift().toLowerCase()]
}