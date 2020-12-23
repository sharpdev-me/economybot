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

import {Client, Message, DMChannel, NewsChannel, TextChannel, Snowflake} from "discord.js";

import { readdir, lstatSync, readdirSync } from "fs";
import * as path from "path";
import { HelpCategories } from "./commands/misc/help_command";

import * as database from "./database";
import { GuildSettings } from "./settings/settings";

const isProduction = process.env.ECONOMY_ENV == "production";

const defaultPrefix = isProduction ? "$" : "$$";

let commands: {[key: string]: Command} = {};

function addCommands(files: string[], currentPath: string) {
    for (const file of files) {
        const filePath = path.resolve(__dirname, currentPath, file);
        if(lstatSync(filePath).isDirectory()) {
            addCommands(readdirSync(filePath), `${currentPath}/${file}`);
            continue;
        }
        const props = require(filePath);
        if(props.aliases) {
            for (let i = 0; i < props.aliases.length; i++) {
                const alias = props.aliases[i];
                commands[alias] = props;
            }
        }
        commands[props.name] = props;
    }
}

export async function register_events(client: Client) {
    return new Promise((reject, resolve) => {
        readdir(path.resolve(__dirname, "./commands"), (err, files) => {
            if(err) return reject(err);
            addCommands(files, "./commands");
    
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
                    if(!message.guild.me.hasPermission("SEND_MESSAGES")) return;
                    const guildSettings = await database.getGuildSettings(message.guild.id);
                    if(!message.content.startsWith(guildSettings.prefix)) {
                        if(!guildSettings.watchMessages) return;
                        let lastTime = await database.timeOfLastMessage(message.guild.id, message.author.id);
                        if((Date.now() - lastTime.milliseconds) > guildSettings.messageCooldown) {
                            let bal = await database.getBalance(message.author.id, message.guild.id);
                            bal.balance = bal.balance + guildSettings.messageReward;
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
            client.on("inviteCreate", async (invite) => {
                let referrals = await database.getAllReferrals(invite.guild.id);
                let referralMap = referrals.map(referral => referral.code);
                let guildInvites = await invite.guild.fetchInvites();
                let invitesMap = guildInvites.map(invite => invite.code);
                referralMap.forEach((referralCode) => {
                    if(!invitesMap.includes(referralCode)) {
                        database.deleteReferral(referralCode);
                    }
                });

                guildInvites.forEach((invite) => {
                    if(!referralMap.includes(invite.code)) {
                        new database.Referral(invite.inviter.id, invite.guild.id, invite.code, invite.url, invite.uses).save();
                    }
                });

                new database.Referral(invite.inviter.id, invite.guild.id, invite.code, invite.url, 0).save();
            });
            client.on("inviteDelete", async (invite) => {
                let referrals = await database.getAllReferrals(invite.guild.id);
                let referralMap = referrals.map(referral => referral.code);
                let guildInvites = await invite.guild.fetchInvites();
                let invitesMap = guildInvites.map(invite => invite.code);
                referralMap.forEach((referralCode) => {
                    if(!invitesMap.includes(referralCode)) {
                        database.deleteReferral(referralCode);
                    }
                });

                guildInvites.forEach((invite) => {
                    if(!referralMap.includes(invite.code)) {
                        new database.Referral(invite.inviter.id, invite.guild.id, invite.code, invite.url, invite.uses).save();
                    }
                });
                if(database.getReferral(invite.code) != null) database.deleteReferral(invite.code);
            });
            client.on("guildMemberAdd", async (member) => {
                const guildSettings = await database.getGuildSettings(member.guild.id);
                if(!guildSettings.referrals) return;
                let referrals = (await database.getAllReferrals(member.guild.id));
                let invites = await member.guild.fetchInvites();

                invites.forEach(async (invite) => {
                    let referral = referrals.find(referral => referral.code == invite.code);
                    if(invite.uses >= referral.uses + 1) {
                        referral.uses = invite.uses;
                        referral.save();
                        let inviterBalance = await database.getBalance(referral.issuer, member.guild.id);
                        inviterBalance.balance += guildSettings.referrerAmount;
                        inviterBalance.save();
                    }
                })
            });
            client.on("roleDelete", async (role) => {
                if(await database.getRole(role.id) != null) {
                    database.delRole(role.id);
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

export function getCommands() {
    return commands;
}

export interface Command {
    readonly name: string;
    readonly aliases?: string[];
    readonly help?: string;
    readonly category?: HelpCategories;
    readonly run: (args: string[], message: Message, settings?: GuildSettings) => void;
}