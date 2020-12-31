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

import { GuildMember, ApplicationCommandInteractionData, Interaction, InteractionApplicationCommandCallbackData, InteractionResponse, InteractionResponseType } from "slash-commands";
import { getBalance } from "../../util/database";
import { GuildSettings } from "../../util/settings";

export async function run(data: ApplicationCommandInteractionData, member: GuildMember, settings: GuildSettings, interaction: Interaction): Promise<InteractionResponse> {
    return {type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {
        content: `Your balance is \`${(await getBalance(member.user.id, settings.id)).balance} ${settings.currency}\``
    }}
}

export const name = "balance";
export const description = "Views your current balance";