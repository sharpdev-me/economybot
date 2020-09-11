import * as Discord from "discord.js";
import {register_events} from "./discord_events";


const dClient = new Discord.Client();

register_events(dClient).catch(console.error).then(() => dClient.login(process.env.ECONOMY_TOKEN));