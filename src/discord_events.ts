import {Client, Message, DMChannel, NewsChannel, TextChannel} from "discord.js";

import { readdir } from "fs";
import * as path from "path";

import * as database from "./database";

const isProduction = process.env.ECONOMY_ENV == "production";

const defaultPrefix = isProduction ? "$" : "$$";

export const commands: any = {};

export async function register_events(client: Client) {
    return new Promise((reject, resolve) => {
        readdir(path.resolve(__dirname, "./commands"), (err, files) => {
            if(err) return reject(err);
            for (const file of files) {
                const filePath = path.resolve(__dirname, "./commands/", file);
                const props = require(filePath);
                if(props.aliases) {
                    for (let i = 0; i < props.aliases.length; i++) {
                        const alias = props.aliases[i];
                        commands[alias] = props;
                    }
                }
                commands[props.name] = props;
            }
    
            client.on("message", async (message: Message) => {
                if(message.author.bot) return;
                if(message.channel instanceof NewsChannel) return;
                if(message.channel instanceof DMChannel) {
                    if(!message.content.startsWith(defaultPrefix)) return;
                    // Handle command sent to the bot via DMs
                    const split = splitMessage(message, defaultPrefix);
                    if(split[1].startsWith("sd") && message.author.id != "532368416380551168") return;
                    const cmd = commands[split[1]];
                    if(!cmd) return;
                    cmd.run(split[0], message);
                } else if(message.channel instanceof TextChannel) {
                    // Fetch GuildSettings
                    const guildSettings = await database.getGuildSettings(message.guild.id);
                    if(!message.content.startsWith(guildSettings.prefix)) {
                        const eventSettings = await database.getEventSettings(message.guild.id);
                        if(!eventSettings.watchMessages) return;
                        let lastTime = await database.timeOfLastMessage(message.guild.id, message.author.id);
                        if((Date.now() - lastTime.milliseconds) > eventSettings.messageCooldown) {
                            let bal = await database.getBalance(message.author.id, message.guild.id);
                            bal.balance = bal.balance + eventSettings.messageReward;
                            bal.save();
                            lastTime.milliseconds = Date.now();
                            lastTime.save();
                        }
                        return;
                    }
                    const split = splitMessage(message, guildSettings.prefix);
                    if(split[1].startsWith("sd") && message.author.id != "532368416380551168") return;
                    const cmd = commands[split[1]];
                    if(!cmd) return;
                    cmd.run(split[0], message, guildSettings);
                }
            });
            resolve();
        });
    });
}

function splitMessage(message: Message, prefix: string): [string[], string] {
    const content = message.content;
    const args = content.slice(prefix.length).trim().split(/ +/g);
    return [args, args.shift().toLowerCase()]
}