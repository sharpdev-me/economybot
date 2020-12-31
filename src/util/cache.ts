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

import * as redis from "redis";
import { promisify } from "util";

const client = redis.createClient({host: process.env.ECONOMY_REDIS_HOST, password: process.env.ECONOMY_REDIS});

export const get: (key: string) => Promise<string> = promisify(client.get).bind(client);
export const set: (key: string, val: string) => Promise<string> = promisify(client.set).bind(client);
export const expire: (key: string, seconds: number) => Promise<number> = promisify(client.expire).bind(client);
export const exists: (key: string) => Promise<number> = promisify(client.exists).bind(client);
export const del: (...keys: string[]) => Promise<number> = promisify(client.del).bind(client);