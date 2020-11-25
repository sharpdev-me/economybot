import * as Discord from "discord.js";
import {register_events} from "./discord_events";

import * as express from "express";
import * as bodyParser from "body-parser";
import { getBalance, getBalances, getGuildSettings, getToken, isToken } from "./database";

const dClient = new Discord.Client();

const webAPI = express();

const isProduction = process.env.ECONOMY_ENV == "production";

webAPI.use(bodyParser.json());
webAPI.use(bodyParser.urlencoded({extended:false}));

webAPI.get("/stats", async (req, res) => {
    let response = {
        guild_count:dClient.guilds.cache.size,
        user_count:dClient.users.cache.size,
    };
    res.status(200).send(response);
});

webAPI.get("/guilds/:guildID", async (req, res) => {
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

dClient.on("ready", async () => {
    console.log("Bot Online");
    console.log(`Guilds: ${dClient.guilds.cache.size}\nUsers: ${dClient.users.cache.size}`);
});

register_events(dClient).catch(console.error).then(() => dClient.login(process.env.ECONOMY_TOKEN).then(() => webAPI.listen(3000)));