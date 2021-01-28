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

import { Message } from "discord.js";
import { GuildSettings } from "../../util/settings";
import { HelpCategories } from "../misc/help_command";
import { RESTART_SCRIPT } from "../../util/constants";
import { spawn } from "child_process";

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    spawn(RESTART_SCRIPT, {
        stdio: "ignore"
    });
    setTimeout(process.exit, 3000, 0);
}

export const name = "sd_manual_update";
export const aliases = ["sd_mu"];
export const category = HelpCategories.HIDE;