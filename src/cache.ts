// Cache GuildSettings until 30 seconds of inactivty
// Cache EventSettings until 30 seconds of inactivity

// https://www.npmjs.com/package/redis

import * as redis from "redis";

export interface Serializable {
    serialize(): string;
}