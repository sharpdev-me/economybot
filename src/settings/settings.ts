import { Snowflake } from "discord.js";
import { getDatabase } from "../database";

const isProduction = process.env.ECONOMY_ENV == "production";

export const settingsDescriptions = {
    prefix: "The symbol placed before commands",
    defaultBalance: "The balance to give new members",
    currency: "The name of your currency",
    allowRoleRefunds: "Enable refunding purchased roles",
    refundModifier: "The modifier of the role cost when giving a refund",
    enableGambling: "Whether or not to enable EconomyBot gambling commands",
    watchMessages: "Enable rewards for sending messages",
    messageReward: "The amount to reward a message",
    messageCooldown: "The time in milliseconds between messages required to get a reward",
    referrals: "Enable getting rewards for inviting new users",
    referrerAmount: "The amount to give a referrer when their link is used",
}

export interface GuildSettings {
    readonly id: Snowflake;

    // General settings
    prefix: string;
    defaultBalance: number;
    currency: string;
    allowRoleRefunds: boolean;
    refundModifier: number;
    enableGambling: boolean;
    managers: Snowflake[];

    // Event Settings
    watchMessages: boolean;
    messageReward: number;
    messageCooldown: number;
    referrals: boolean;
    referrerAmount: number;

    save(): Promise<void>;
}

export function emptyGuildSettings(id: Snowflake): GuildSettings {
    let r: any = {
        id: id,
        prefix: isProduction ? "$" : "$$",
        defaultBalance: 100,
        currency: "coins",
        allowRoleRefunds: true,
        refundModifier: 0.5,
        enableGambling: false,
        managers: [],
        watchMessages: false,
        messageReward: 0,
        messageCooldown: 0,
        referrals: false,
        referrerAmount: 0,
    };

    r.save = async () => {
        const db = await getDatabase();
        db.collection("guildSettings").replaceOne({id:id}, r, {upsert: true});
    }

    let rr: GuildSettings = r;
    return rr;
}

