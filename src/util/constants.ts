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

import {readFileSync, Stats, statSync} from "fs";
import {resolve as pathResolve} from "path";

const gitInfoPath = pathResolve(__dirname, "../../", "git.json");

export const BOT_VERSION = "1.0.0"
export const PRODUCTION = process.env.ECONOMY_ENV == "production";
export const COOKIE_SIGNATURE = process.env.COOKIE_SIGNATURE;
export const RESTART_SCRIPT = process.env.RESTART_SCRIPT;
export const GIT_INFO: GitInfo = (() => {
    try {
        statSync(gitInfoPath);
        return true;
    } catch(e) {
        return false;
    }
})() ? JSON.parse(readFileSync(gitInfoPath, {encoding: "utf-8"})) : null;

export type GitInfo = {
    hash: string,
    short_hash: string,
    message: string
}