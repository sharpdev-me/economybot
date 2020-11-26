import {Client, Message, DMChannel, NewsChannel, TextChannel, Snowflake} from "discord.js";

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
                const eventSettings = await database.getEventSettings(member.guild.id);
                if(!eventSettings.referrals) return;
                let referrals = (await database.getAllReferrals(member.guild.id));
                let invites = await member.guild.fetchInvites();

                invites.forEach(async (invite) => {
                    let referral = referrals.find(referral => referral.code == invite.code);
                    if(invite.uses >= referral.uses + 1) {
                        referral.uses = invite.uses;
                        referral.save();
                        let invitedBalance = await database.getBalance(member.id, member.guild.id);
                        let inviterBalance = await database.getBalance(referral.issuer, member.guild.id);
                        inviterBalance.balance += eventSettings.referrerAmount;
                        invitedBalance.balance += eventSettings.referredAmount;
                        invitedBalance.save();
                        inviterBalance.save();
                    }
                })
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