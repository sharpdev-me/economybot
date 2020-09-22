import { MongoClient } from "mongodb";

import { Snowflake } from "discord.js";

import * as cache from "./cache";

const url = `mongodb://10.0.0.194:27017/`

let client: MongoClient;

export async function getClient(): Promise<MongoClient> {
    if(!client) {
        client = await new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true, auth: {user: "economy", password: process.env.ECONOMY_MONGO}, authSource: "economybot"}).connect();
    }
    return client;
}

export async function close(): Promise<void> {
    client.close();
}

export async function getGuildSettings(id: Snowflake): Promise<GuildSettings> {
    if(await cache.exists("guildSettings." + id) === 1) {
        cache.expire("guildSettings." + id, 30);
        return GuildSettings.fromJSON(await cache.get("guildSettings." + id));
    }
    const client = await getClient();
    const settings: GuildSettings | void = await client.db("economybot").collection<GuildSettings>("guildSettings").findOne({id:id});
    let s: GuildSettings;
    if(!settings) {
        s = new GuildSettings(id, "$", 100, "coins", []);
    } else {
        s = new GuildSettings(settings.id, settings.prefix, settings.defaultBalance, settings.currency, settings.managers);
    }
    cache.set("guildSettings." + id, JSON.stringify(s)).catch(console.error).then(() => cache.expire("guildSettings." + id, 30));
    return s;
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
    if(await cache.exists("eventSettings." + guildID) === 1) {
        cache.expire("eventSettings." + guildID, 30);
        return EventSettings.fromJSON(await cache.get("eventSettings." + guildID));
    }
    const client = await getClient();

    const eventSettings: EventSettings | null = await client.db("economybot").collection<EventSettings>("eventSettings").findOne({id: guildID});
    let s: EventSettings;
    if(!eventSettings) {
        s = new EventSettings(guildID, false, 0, 0, false, 0);
    } else {
        s = new EventSettings(guildID, eventSettings.watchMessages, eventSettings.messageReward, eventSettings.messageCooldown, eventSettings.watchInvites, eventSettings.inviteReward);
    }
    cache.set("eventSettings." + guildID, JSON.stringify(s)).catch(console.error).then(() => cache.expire("eventSettings." + guildID, 30));
    return s;
}

export class UserBalance {
    readonly userID: Snowflake;
    readonly guildID: Snowflake;

    balance: number;

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


export class GuildSettings {
    readonly id: Snowflake;

    prefix: string;

    defaultBalance: number;
    currency: string;

    managers: Snowflake[];

    constructor(id: Snowflake, prefix: string, defaultBalance: number, currency: string, managers: Snowflake[]) {
        this.id = id;
        this.prefix = prefix;
        this.defaultBalance = defaultBalance;
        this.currency = currency;
        this.managers = managers;
    }

    async save() {
        const client = await getClient();

        client.db("economybot").collection("guildSettings").replaceOne({id: this.id}, this, {upsert: true}).catch(console.error);
    }

    static fromJSON(json: string): GuildSettings {
        const obj = JSON.parse(json);
        return new GuildSettings(obj.id, obj.prefix, obj.defaultBalance, obj.currency, obj.managers)
    }
}

export class EventSettings {
    readonly id: Snowflake;

    watchMessages: boolean;
    messageReward: number;
    messageCooldown: number;

    watchInvites: boolean;
    inviteReward: number;

    constructor(id: Snowflake, watchMessages: boolean, messageReward: number, messageCooldown: number, watchInvites: boolean, inviteReward: number) {
        this.id = id;
        this.watchMessages = watchMessages;
        this.messageReward = messageReward;
        this.messageCooldown = messageCooldown;
        this.watchInvites = watchInvites;
        this.inviteReward = inviteReward;
    }

    async save() {
        const client = await getClient();
        
        client.db("economybot").collection("eventSettings").replaceOne({id: this.id}, this, {upsert: true}).catch(console.error);
    }

    static fromJSON(json: string): EventSettings {
        const obj = JSON.parse(json);
        return new EventSettings(obj.id, obj.watchMessages, obj.messageReward, obj.messageCooldown, obj.watchInvites, obj.inviteReward);
    }
}