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

import * as Discord from "discord.js";
import {register_events} from "./discord_events";

import * as express from "express";
import * as bodyParser from "body-parser";
import { getAllReferrals, getBalance, getBalances, getGuildSettings, getToken, isToken, Referral, deleteReferral, getGuildCount } from "./database";
import { beginHandling } from "./slash-commands/slash_handler";

const dClient = new Discord.Client();

const webApp = express();

const isProduction = process.env.ECONOMY_ENV == "production";

const botVersion = "1.0.0";

let available = false;

const webAPI = express.Router();

webAPI.use(bodyParser.json());
webAPI.use(bodyParser.urlencoded({extended:false}));

webAPI.get("/available", async (req, res) => {
    res.status(200).send({available:available});
})

webAPI.get("/stats", async (req, res) => {
    if(!available) return res.status(409).send({error:"bot not available"});
    let response = {
        guild_count:await getGuildCount(),
        version: botVersion,
        uptime: dClient.uptime,
        url: "https://economybot.xyz/"
    };
    res.status(200).send(response);
});

webAPI.get("/guilds/:guildID", async (req, res) => {
    if(!available) return res.status(409).send({error:"bot not available"});
    const guildID = req.params.guildID;
    if(!req.query.token) return res.status(400).send({error:"malformed request",message:"No token has been provided"});
    const token = req.query.token.toString();

    // Ensure token has access to this guild

    if(!await isToken(token)) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    const apiToken = await getToken(token);
    if(apiToken.guild !== guildID) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    try {
        let guild = await dClient.guilds.fetch(guildID);
        let guildSettings = await getGuildSettings(guildID);
        let managers = guildSettings.managers;
        managers.push(guild.ownerID);
        res.status(200).send({
            id:guildID,
            icon:guild.iconURL(),
            managers:managers,
            prefix:guildSettings.prefix,
            currency:guildSettings.currency,
            default_balance:guildSettings.defaultBalance
        });
    } catch(e) {
        console.error(e);
        res.status(500).send({error:e.name,message:e.message});
    }
    
});

webAPI.get("/guilds/:guildID/balances", async (req, res) => {
    if(!available) return res.status(409).send({error:"bot not available"});
    const guildID = req.params.guildID;
    if(!req.query.token) return res.status(400).send({error:"malformed request",message:"No token has been provided"});
    const token = req.query.token.toString();

    // Ensure token has access to this guild

    if(!await isToken(token)) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    const apiToken = await getToken(token);
    if(apiToken.guild !== guildID) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    try {
        let balances = await getBalances(guildID);
        res.status(200).send(balances);
    } catch(e) {
        console.error(e);
        res.status(500).send({error:e.name,message:e.message});
    }
});

webAPI.get("/guilds/:guildID/balances/:userID", async (req, res) => {
    if(!available) return res.status(409).send({error:"bot not available"});
    const guildID = req.params.guildID;
    const userID = req.params.userID;
    if(!req.query.token) return res.status(400).send({error:"malformed request",message:"No token has been provided"});
    const token = req.query.token.toString();

    // Ensure token has access to this guild

    if(!await isToken(token)) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    const apiToken = await getToken(token);
    if(apiToken.guild !== guildID) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    try {
        let balance = await getBalance(userID, guildID);
        res.status(200).send(balance);
    } catch(e) {
        console.error(e);
        res.status(500).send({error:e.name,message:e.message});
    }
});

webAPI.put("/guilds/:guildID/balances/:userID", async (req, res) => {
    if(!available) return res.status(409).send({error:"bot not available"});
    const guildID = req.params.guildID;
    const userID = req.params.userID;
    if(!req.query.token) return res.status(400).send({error:"malformed request",message:"No token has been provided"});
    const token = req.query.token.toString();
    if(!req.query.balance) return res.status(400).send({error:"malformed request",message:"No balance has been provided"});
    const balance = Number(req.query.balance);
    if(isNaN(balance)) return res.status(400).send({error:"malformed request",message:"Balance must be a number"});

    // Ensure token has access to this guild

    if(!await isToken(token)) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    const apiToken = await getToken(token);
    if(apiToken.guild !== guildID) return res.status(401).send({error:"invalid token",message:"Token does not exist or does not have access to the requested resource"});

    try {
        let apiBalance = await getBalance(userID, guildID);
        apiBalance.balance = balance;
        await apiBalance.save();
        res.status(200).send(apiBalance);
    } catch(e) {
        console.error(e);
        res.status(500).send({error:e.name,message:e.message});
    }
});

webApp.use("/api", webAPI);

dClient.on("ready", async () => {
    console.log("Bot Online");
    console.log(`Guilds: ${dClient.guilds.cache.size}\nUsers: ${dClient.users.cache.size}`);
    dClient.user.setPresence({activity: {type: "LISTENING", name: "$invite | v" + botVersion}, status: "online"});

    dClient.guilds.cache.forEach(async guild => {
        let referrals = await getAllReferrals(guild.id);
        let referralMap = referrals.map(referral => referral.code);
        let guildInvites = await guild.fetchInvites();
        let invitesMap = guildInvites.map(invite => invite.code);
        referralMap.forEach((referralCode) => {
            if(!invitesMap.includes(referralCode)) {
                deleteReferral(referralCode);
            }
        });

        guildInvites.forEach((invite) => {
            if(!referralMap.includes(invite.code)) {
                new Referral(invite.inviter.id, invite.guild.id, invite.code, invite.url, invite.uses).save();
            }
        });        
    });
    available = true;
});

webApp.listen(process.env.ECONOMY_PORT || 3000);
beginHandling(webApp).catch(console.error);
register_events(dClient).catch(console.error).then(() => dClient.login(process.env.ECONOMY_TOKEN));