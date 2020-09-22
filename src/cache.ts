// Cache GuildSettings until 30 seconds of inactivty
// Cache EventSettings until 30 seconds of inactivity

// https://www.npmjs.com/package/redis

import * as redis from "redis";
import { promisify } from "util";

const client = redis.createClient({host: "10.0.0.194", password: process.env.ECONOMY_REDIS});

export const get: (key: string) => Promise<string> = promisify(client.get).bind(client);
export const set: (key: string, val: string) => Promise<string> = promisify(client.set).bind(client);
export const expire: (key: string, seconds: number) => Promise<number> = promisify(client.expire).bind(client);
export const exists: (key: string) => Promise<number> = promisify(client.exists).bind(client);
export const del: (...keys: string[]) => Promise<number> = promisify(client.del).bind(client);