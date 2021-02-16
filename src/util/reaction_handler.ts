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

import { CollectorFilter, Message, MessageReaction, ReactionCollector, ReactionCollectorOptions, User } from "discord.js";


export function createReactionHandler(message: Message, filter?: CollectorFilter, options?: ReactionCollectorOptions): ReactionHandler {
    if(!filter) filter = () => true;
    if(!options) options = {
        idle: 15000
    };
    const collector = message.createReactionCollector(filter, options);
    return new ReactionHandler(collector);
}


export class ReactionHandler {
    private reactions: {[key: string]: ReactionHandle} = {};
    public unknown: (reaction: MessageReaction, user: User) => void;
    constructor(private collector: ReactionCollector) {
        collector.on("collect", (r, u) => {
            if(u.bot) return;
            const callback = this.reactions[r.emoji.name];
            console.dir(this.reactions);
            console.dir(callback);
            if(!callback) {
                if(!this.unknown) return;
                this.unknown.call(collector, r, u);
            };
            callback.call(collector, r, u);
        });
    }

    public set end(v: () => void) {
        this.collector.on("end", v);
    }

    public addReaction(name: string, callback: ReactionHandle, addToMessage?: boolean) {
        if(addToMessage) {
            this.collector.message.react(name);
        }
        this.reactions[name] = callback;
    }

    public stop(reason?: string) {
        this.collector.stop(reason);
    }
}

type ReactionHandle = (reaction: MessageReaction, user: User) => void;