import { MongoClient } from "mongodb";

import { Snowflake } from "discord.js";
import { Serializable } from "./cache";

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
    const client = await getClient();
    const settings: GuildSettings | void = await client.db("economybot").collection<GuildSettings>("guildSettings").findOne({id:id});
    if(!settings) {
        return new GuildSettings(id, "$", 100, "coins", []);
    }
    return new GuildSettings(settings.id, settings.prefix, settings.defaultBalance, settings.currency, settings.managers);
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
        return new EventSettings(guildID, false, 0, 0, false, 0);
    }
    return new EventSettings(guildID, eventSettings.watchMessages, eventSettings.messageReward, eventSettings.messageCooldown, eventSettings.watchInvites, eventSettings.inviteReward);
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

export class GuildSettings implements Serializable {
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

    serialize(): string {
        return JSON.stringify(this);
    }

    async save() {
        const client = await getClient();

        client.db("economybot").collection("guildSettings").replaceOne({id: this.id}, this, {upsert: true}).catch(console.error);
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
}