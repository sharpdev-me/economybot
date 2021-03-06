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

import { Db, MongoClient } from "mongodb";

import { Snowflake } from "discord.js";

import * as crypto from "crypto";

import * as cache from "./cache";

import { GuildSettings, emptyGuildSettings, saveGuildSettings } from "./settings";

const isProduction = process.env.ECONOMY_ENV == "production";

const defaultPrefix = isProduction ? "$" : "$$";

const url = process.env.ECONOMY_MONGO_URL;

let client: MongoClient;

export async function getClient(): Promise<MongoClient> {
    if(!client) {
        client = await new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true, auth: {user: "economy", password: process.env.ECONOMY_MONGO}, authSource: "economybot"}).connect();
    }
    return client;
}

export async function getDatabase(): Promise<Db> {
    return (await getClient()).db(isProduction ? "economybot" : "economytest");
}

export async function close(): Promise<void> {
    client.close();
}

export async function getGuildCount(): Promise<number> {
    const database = await getDatabase();

    let amount = 0;

    let cursor = database.collection("guildSettings").find({});
    while(await cursor.hasNext()) {
        amount++;
        cursor.next();
    }

    return amount;
}

export async function getGuildSettings(id: Snowflake): Promise<GuildSettings> {
    const database = await getDatabase();
    const settings: any | void = await database.collection<GuildSettings>("guildSettings").findOne({id:id});
    let s: GuildSettings;
    if(!settings) {
        s = emptyGuildSettings(id);
        saveGuildSettings(s);
    } else {
        const empty: any = emptyGuildSettings(id);

        let changed: boolean = false;

        for (const key in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                if(!Object.prototype.hasOwnProperty.call(empty, key)) {
                    delete settings[key];
                    changed = true;
                }
            }
        }

        for (const key in empty) {
            if (Object.prototype.hasOwnProperty.call(empty, key)) {
                const empty_value = empty[key];
                if(!Object.prototype.hasOwnProperty.call(settings, key)) {
                    settings[key] = empty_value;
                    changed = true;
                }
            }
        }

        s = settings;

        if(changed) saveGuildSettings(s);
    }
    if(isProduction) cache.set("guildSettings." + id, JSON.stringify(s)).catch(console.error).then(() => cache.expire("guildSettings." + id, 30));
    return s;
}

export async function getBalance(userID: Snowflake, guildID: Snowflake): Promise<UserBalance> {
    const database = await getDatabase();
    
    const balance: UserBalance | void = await database.collection("balances").findOne({userID: userID, guildID: guildID});
    if(!balance) {
        const settings = await getGuildSettings(guildID);
        return new UserBalance(settings.defaultBalance, userID, guildID);
    }
    return new UserBalance(balance.balance, balance.userID, balance.guildID);
}

export async function getBalances(guildID: Snowflake): Promise<UserBalance[]> {
    const database = await getDatabase();

    const balances = await database.collection<UserBalance>("balances").find({guildID: guildID});
    return (await balances.toArray()).map(ub => new UserBalance(ub.balance, ub.userID, ub.guildID)).sort((a,b) => b.balance - a.balance);
    
}

export async function isToken(token: string): Promise<boolean> {
    const database = await getDatabase();

    return (await database.collection("api_tokens").findOne({token:token}) != null);
}

export async function getToken(token: string): Promise<APIToken> {
    if(!await isToken(token)) return null;
    const database = await getDatabase();
    return await database.collection<APIToken>("api_tokens").findOne({token:token});
}

export async function newToken(guild: Snowflake, issuer: Snowflake, name: string): Promise<APIToken> {
    let token = crypto.randomBytes(35).toString("hex");
    if(await isToken(token)) return newToken(guild, issuer, name);
    
    const database = await getDatabase();

    let r: APIToken = {token: token, guild: guild, issuer: issuer, name: name};
    database.collection<APIToken>("api_tokens").insertOne(r);
    return r;
}

export async function listTokens(guild: Snowflake): Promise<APIToken[]> {
    const database = await getDatabase();

    let result = await database.collection<APIToken>("api_tokens").find({guild: guild});
    let b: APIToken[] = [];
    while(await result.hasNext()) {
        b.push(await result.next());
    }
    return b;
}

export async function removeToken(guild: Snowflake, name: string): Promise<boolean> {
    const database = await getDatabase();

    let result = await database.collection<APIToken>("api_tokens").deleteMany({guild:guild,name:name});

    return result.deletedCount > 0;
}

export async function timeOfLastMessage(guild: Snowflake, user: Snowflake): Promise<MessageDate> {
    const database = await getDatabase();

    let t = await database.collection<MessageDate>("message_dates").findOne({guild: guild, user: user});
    if(t == null) {
        t = new MessageDate(user, guild);
        t.save();
    }
    t.save = async () => {
        const database = await getDatabase();

        database.collection("message_dates").replaceOne({user:user,guild:guild}, this, {upsert: true}).catch(console.error);
    }
    return t;
}

export async function getReferral(code: string): Promise<Referral | null> {
    const database = await getDatabase();

    return Referral.fromDb(await database.collection<Referral>("referrals").findOne({code:code}));
}

export async function getReferrals(issuer: Snowflake, guild: Snowflake): Promise<Referral[]> {
    const database = await getDatabase();

    let returnResults: Referral[] = [];

    let results = database.collection<Referral>("referrals").find({issuer: issuer, guild: guild});

    while(await results.hasNext()) {
        returnResults.push(Referral.fromDb(await results.next()));
    }

    return returnResults;
}

export async function getAllReferrals(guild: Snowflake): Promise<Referral[]> {
    const database = await getDatabase();

    let returnResults: Referral[] = [];

    let results = database.collection<Referral>("referrals").find({guild:guild});

    while(await results.hasNext()) {
        returnResults.push(Referral.fromDb(await results.next()));
    }

    return returnResults;
}

export async function deleteReferral(code: string) {
    const database = await getDatabase();

    database.collection<Referral>("referrals").deleteOne({code:code});
}

export async function getRole(id: Snowflake) {
    const database = await getDatabase();

    return await database.collection<ManagedRole>("managedRoles").findOne({id:id});
}

export async function getRoles(guildID: Snowflake) {
    const database = await getDatabase();

    let results: ManagedRole[] = [];
    let res = database.collection<ManagedRole>("managedRoles").find({guild:guildID});

    while(await res.hasNext()) {
        results.push(await res.next());
    }

    return results;
}

export async function addRole(role: ManagedRole) {
    (await getDatabase()).collection("managedRoles").replaceOne({id:role.id}, role, {upsert: true});
}

export async function delRole(id: Snowflake) {
    (await getDatabase()).collection("managedRoles").deleteOne({id:id});
}

export async function storeOAuthUser(user: OAuthUser) {
    (await getDatabase()).collection("oauthUsers").replaceOne({id:user.id}, user, {upsert: true});
}

export async function hasOAuthUser(state: string): Promise<boolean> {
    return (await (await getDatabase()).collection("oauthUsers").findOne({state: state})) != null;
}

export async function getOAuthUser(state: string): Promise<OAuthUser> {
    return (await (await getDatabase()).collection("oauthUsers").findOne({state: state}));
}

// Create interfaces/classes for saving & getting state, access token, refresh token of authenticated user

export interface OAuthUser {
    id: Snowflake,
    avatar: string,
    discriminator: string,
    username: string,
    access_token: string,
    refresh_token: string,
    state: string
}

export class Referral {
    readonly issuer: Snowflake;
    readonly guild: Snowflake;
    readonly code: string;
    readonly url: string;

    uses: number;

    constructor(issuer: Snowflake, guild: Snowflake, code: string, url: string, uses: number) {
        this.issuer = issuer;
        this.guild = guild;
        this.code = code;
        this.url = url;
        this.uses = uses;
    }

    async save() {
        const database = await getDatabase();

        database.collection("referrals").replaceOne({code:this.code}, this, {upsert:true}).catch(console.error);
    }

    static fromDb(referral: Referral): Referral {
        return new Referral(referral.issuer, referral.guild, referral.code, referral.url, referral.uses);
    }
}

export class MessageDate {
    readonly user: Snowflake;
    readonly guild: Snowflake;

    milliseconds: number;

    constructor(user: Snowflake, guild: Snowflake) {
        this.user = user;
        this.guild = guild;
        this.milliseconds = Date.now();
    }

    async save() {
        const database = await getDatabase();

        database.collection("message_dates").replaceOne({user:this.user,guild:this.guild}, this, {upsert: true}).catch(console.error);
    }
}

export interface APIToken {
    readonly token: string;
    readonly guild: Snowflake;
    readonly issuer: Snowflake;
    readonly name: string;
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
        const database = await getDatabase();
        database.collection("balances").replaceOne({userID: this.userID, guildID: this.guildID}, this, {upsert: true}).catch(console.error);
    }
}


export interface ManagedRole {
    readonly id: Snowflake;
    readonly guild: Snowflake;
    readonly cost: number;
}