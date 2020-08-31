import * as Discord from "discord.js";
import {register_events} from "./discord_events";
import * as path from "path";


const dClient = new Discord.Client();

register_events(dClient);

dClient.login(process.env.ECONOMY_TOKEN);

export {dClient};