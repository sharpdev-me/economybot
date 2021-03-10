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

import { PermissionString, Snowflake } from "discord.js";
import { getDatabase } from "./database";

const isProduction = process.env.ECONOMY_ENV == "production";

export const settingsDescriptions = {
    prefix: "The symbol placed before commands",
    defaultBalance: "The balance to give new members",
    currency: "The name of your currency",
    allowRoleRefunds: "Enable refunding purchased roles",
    refundModifier: "The modifier of the role cost when giving a refund",
    enableGambling: "Whether or not to enable EconomyBot gambling commands",
    minBlackjackBet: "The minimum amount required to enter a blackjack game",
    maxBlackjackBet: "The maximum amount allowed to enter a blackjack game (set to 0 to have no maximum)",
    watchMessages: "Enable rewards for sending messages",
    messageReward: "The amount to reward a message",
    messageCooldown: "The time in milliseconds between messages required to get a reward",
    referrals: "Enable getting rewards for inviting new users",
    referrerAmount: "The amount to give a referrer when their link is used",
    checkOthersBalance: "Allow members to check the balance of others"
}

export const settingsPermissions: {[key: string]: PermissionString} = {
    referrals: "MANAGE_GUILD",
    referrerAmount: "MANAGE_GUILD",
    allowRoleRefunds: "MANAGE_ROLES",
    enableGambling: "MANAGE_MESSAGES"
}

export interface GuildSettings {
    readonly id: Snowflake;

    // General settings
    prefix: string;
    defaultBalance: number;
    currency: string;
    allowRoleRefunds: boolean;
    refundModifier: number;
    managers: Snowflake[];
    checkOthersBalance: boolean;

    // Event Settings
    watchMessages: boolean;
    messageReward: number;
    messageCooldown: number;
    referrals: boolean;
    referrerAmount: number;

    // Gambling Settings
    enableGambling: boolean;
    minBlackjackBet: number;
    maxBlackjackBet: number;
}

export async function saveGuildSettings(settings: GuildSettings) {
    const db = await getDatabase();
    db.collection("guildSettings").replaceOne({id:settings.id}, settings, {upsert: true});
}

export function emptyGuildSettings(id: Snowflake): GuildSettings {
    return {
        id: id,
        prefix: isProduction ? "$" : "$$",
        defaultBalance: 100,
        currency: "coins",
        allowRoleRefunds: true,
        refundModifier: 0.5,
        managers: [],
        checkOthersBalance: true,
        watchMessages: false,
        messageReward: 0,
        messageCooldown: 0,
        referrals: false,
        referrerAmount: 0,
        enableGambling: false,
        minBlackjackBet: 0,
        maxBlackjackBet: 0
    };
}

