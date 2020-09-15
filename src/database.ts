import { MongoClient } from "mongodb";

import { Snowflake } from "discord.js";

const url = `mongodb://10.0.0.194:27017/`

let client: MongoClient;

let cache: any = {}

export async function getClient(): Promise<MongoClient> {
    return new Promise<MongoClient>((resolve, reject) => {
        if(!client) {
            new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true, auth: {user: "economy", password: process.env.ECONOMY_MONGO}, authSource: "economybot"}).connect().catch(reject).then((cl: MongoClient) => {
                client = cl;
                resolve(cl);
            });
        } else {
            resolve(client);
        }
    });
}

export function close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        client.close().catch(reject).then(resolve);
    });
}

export function getGuildSettings(id: Snowflake): Promise<GuildSettings> {
    return new Promise<GuildSettings>((resolve, reject) => {
        if(!cache[id]) {
            getClient().catch(reject).then((client: MongoClient) => {
                client.db("economybot").collection<GuildSettings>("guildSettings").findOne({id: id}).catch(reject).then((settings: GuildSettings) => {
                    if(!settings) {
                        const f: GuildSettings = {id: id,prefix:"$",defaultBalance:100,currency:"coins",managers:[]}
                        saveGuildSettings(f).catch(reject);
                        return resolve(f);
                    }
                    resolve(settings);
                });
            })
        } else {
            return resolve(cache[id]);
        }
    })
}

export function saveGuildSettings(settings: GuildSettings): Promise<void> {
    return new Promise((resolve, reject) => {
        getClient().catch(reject).then((client: MongoClient) => {
            client.db("economybot").collection<GuildSettings>("guildSettings").replaceOne({id:settings.id}, settings, {upsert: true}).catch(reject).then(() => resolve());
        })
    });
}

export async function getBalance(userID: Snowflake, guildID: Snowflake): Promise<UserBalance> {
    const client = await getClient();
    
    const balance: UserBalance | void = await client.db("economybot").collection("balances").findOne({userID: userID, guildID: guildID});
    if(!balance) {
        const settings = await getGuildSettings(guildID);
        return new UserBalance(settings.defaultBalance, userID, guildID);
    }
    return new UserBalance(balance.balance, balance.userID, balance.guildID);
}

export async function getBalances(guildID: Snowflake): Promise<UserBalance[]> {
    const client = await getClient();

    const balances = await client.db("economybot").collection<UserBalance>("balances").find({guildID: guildID});
    return (await balances.toArray()).map(ub => new UserBalance(ub.balance, ub.userID, ub.guildID)).sort((a,b) => b.balance - a.balance);
    
}

export async function getEventSettings(guildID: Snowflake): Promise<EventSettings> {
    const client = await getClient();

    const eventSettings: EventSettings | null = await client.db("economybot").collection<EventSettings>("eventSettings").findOne({id: guildID});
    if(!eventSettings) {
        return {id: guildID,inviteReward:0,messageCooldown:0,messageReward:0,watchInvites:false,watchMessages:false};
    }
    return eventSettings;
}

export async function saveEventSettings(eventSettings: EventSettings): Promise<void> {
    Promise.resolve().then(() => {
        client.db("economybot").collection<EventSettings>("eventSettings").replaceOne({id:eventSettings.id}, eventSettings, {upsert: true}).catch(console.error).then(console.dir);
    });
}

export class UserBalance {
    balance: number;
    readonly userID: Snowflake;
    readonly guildID: Snowflake;

    constructor(balance: number, userID: Snowflake, guildID: Snowflake) {
        this.balance = balance;
        this.userID = userID;
        this.guildID = guildID;
    }

    async save() {
        const client = await getClient();

        client.db("economybot").collection("balances").replaceOne({userID: this.userID, guildID: this.guildID}, this, {upsert: true}).catch(console.error);
    }
}

export interface GuildSettings {
    readonly id: Snowflake;

    prefix: string;

    defaultBalance: number;
    currency: string;

    managers: Snowflake[];
}

export interface EventSettings {
    readonly id: Snowflake;

    watchMessages: boolean;
    messageReward: number;
    messageCooldown: number;

    watchInvites: boolean;
    inviteReward: number;
}