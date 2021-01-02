import { encode } from "punycode";

export function createAuthURL(scopes: ("identify" | "email" | "connections" | "guilds" | "bot")[], state?: string) {
    return encodeURI(`https://discord.com/api/oauth2/authorize?client_id=${process.env.ECONOMY_CLIENT}&redirect_uri=${process.env.OAUTH_CALLBACK}&response_type=code&scope=${scopes.join(" ")}${state !== undefined ? "&state=" + state : ""}`);
}

export function botURL() {
    return encodeURI(`https://discord.com/api/oauth2/authorize?client_id=${process.env.ECONOMY_CLIENT}&permissions=268553217&scope=bot`);
}

export function authAndBot(scopes: ("identify" | "email" | "connections" | "guilds")[]) {
    let newScopes: ("identify" | "email" | "connections" | "guilds" | "bot")[] = scopes;
    newScopes.push("bot");
    return encodeURI(decodeURI(createAuthURL(newScopes)) + "&permissions=268553217");
}