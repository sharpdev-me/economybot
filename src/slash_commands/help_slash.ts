import { ApplicationCommandInteractionData, GuildMember, Interaction } from "slash-commands";
import { GuildSettings } from "../settings/settings";

export async function run(member: GuildMember, data: ApplicationCommandInteractionData, settings: GuildSettings, interaction: Interaction) {
    
}

export const name = "help";
export const description = "help me";