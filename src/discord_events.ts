import {Client, Guild, Message, DMChannel, NewsChannel, TextChannel} from "discord.js";

import * as fs from "fs";
import * as path from "path";

export const commands: any = {};

export function register_events(client: Client) {
    fs.readdir(path.resolve(__dirname, "./commands"), (err, files) => {
        if(err) return console.error(err);
        for (const file of files) {
            const filePath = path.resolve(__dirname, "./commands/", file);
            const props = require(filePath);
            commands[props.name] = props;
        }

        client.on("ready", () => {

        });

        client.on("guildAdd", (guild: Guild) => {
            
        });

        client.on("message", (message: Message) => {
            if(message.author.bot) return;
            if(message.channel instanceof NewsChannel) return;
            if(message.channel instanceof DMChannel) {
                if(!message.content.startsWith("$")) return;
                // Handle command sent to the bot via DMs
                const split = splitMessage(message, "$");
                const cmd = commands[split[1]];
                if(!cmd) return;
                cmd.run(split[0], true, message);
            } else if(message.channel instanceof TextChannel) {
                // Handle command sent to the bot in guild channel
                const split = splitMessage(message, "$");
                const cmd = commands[split[1]];
                if(!cmd) return;
                cmd.run(split[0], false, message);
            }
        });
    });
}

function splitMessage(message: Message, prefix: string): [string[], string] {
    const content = message.content;
    const args = content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    return [args, command];
}