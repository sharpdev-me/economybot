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
import { getBalance } from "../../util/database";
import { createReactionHandler, ReactionHandler } from "../../util/reaction_handler";
import { GuildSettings } from "../../util/settings";
import { HelpCategories } from "../misc/help_command";

const Blackjack: any = require("blackjack-n-deck").Blackjack;

export async function run(args: string[], message: Message, settings?: GuildSettings) {
    if(!settings) return message.channel.send("This command can only be run in a server").catch(console.error);
    if(settings.enableGambling) return message.channel.send("This server does not have gambling enabled.").catch(console.error);

    if(args.length < 1) return message.channel.send("Proper usage is `blackjack <bet>`").catch(console.error);
    
    const betAmount = Number(args[0]);
    if(isNaN(betAmount) || !isFinite(betAmount)) return message.channel.send("The bet amount must be a number").catch(console.error);

    const bjGame = new Blackjack(betAmount, 1);

    try {
        const balance = await getBalance(message.author.id, settings.id);
        balance.balance -= betAmount;
        balance.save();
    } catch(e) {
        console.error(e);
        return message.channel.send("There was an error taking the bet from your balance. Try again in a few moments.");
    }

    bjGame.author = message.author;
    
    let handler: ReactionHandler;
    let gameMessage: Message;

    bjGame.event = async (event: string) => {
        try {
            if(event == "init") {
                try {
                    gameMessage = await message.channel.send(
                        "Before you start reacting, remember that you only have 15 seconds to idle between choices! Taking too long means you automatically stand.\n" + 
                        `Player: ${bjGame.player.cards.map((e:any) => e.image).join(", ")}\nDealer: ${bjGame.dealer.cards.map((e:any) => e.image).join(", ")}\n` +
                        "✋: Hit\n" +
                        "❌: Stand"
                    );
                    handler = createReactionHandler(gameMessage);
                    handler.addReaction("✋", (r, u) => {
                        if(u.id != message.author.id) return;
                        bjGame.hit();
                    }, true);
                    handler.addReaction("❌", (r, u) => {
                        if(u.id != message.author.id) return;
                        bjGame.stand();
                    }, true);
                    handler.end = () => {
                        bjGame.stand();
                    };
                } catch(e) {
                    console.error(e);
                    return message.channel.send("There was a problem setting up your blackjack game. Try again in a few moments.").catch(console.error);
                }
            } else if(event == "win") {
                await endGame(handler, gameMessage, bjGame, settings);
            } else if(event == "bust") {
                await endGame(handler, gameMessage, bjGame, settings);
            } else if(event == "push") {
                await endGame(handler, gameMessage, bjGame, settings);
            } else if(event == "hit") {
                updateMessage(gameMessage, bjGame);
            }
        } catch(e) {
            console.error(e);
        }
    };

    bjGame.init();
}

async function endGame(handler: ReactionHandler, gameMessage: Message, bjGame: any, settings: GuildSettings) {
    handler.stop();
    const channel = gameMessage.channel;
    await gameMessage.delete();
    let response = "";
    const balance = await getBalance(bjGame.author.id, settings.id);
    if(bjGame.status == 1) {
        response = `It looks like you won the game! Your reward is \`${bjGame.bet} ${settings.currency}\``;
        balance.balance += (bjGame.bet * 2);
        balance.save();
    } else if(bjGame.status == 2) {
        response = `It looks like you've lost the game! You've just lost \`${bjGame.bet} ${settings.currency}\``;
    } else if(bjGame.status == 3) {
        response = `You managed to tie with the dealer. Your money has been returned to you.`;
        balance.balance += bjGame.bet;
    }
    await channel.send("Your blackjack game is over! The results of your game were:\n" +
        `Player (${bjGame.player.score}): ${bjGame.player.cards.map((e:any) => e.image).join(", ")}\nDealer (${bjGame.dealer.score}): ${bjGame.dealer.cards.map((e:any) => e.image).join(", ")}\n` +
        response
    );
}

async function updateMessage(gameMessage: Message, bjGame: any) {
    gameMessage.edit(
        "Before you start reacting, remember that you only have 15 seconds to idle between choices! Taking too long means you lose.\n" +
        `Player (${bjGame.player.score}): ${bjGame.player.cards.map((e:any) => e.image).join(", ")}\nDealer (${bjGame.dealer.score}): ${bjGame.dealer.cards.map((e:any) => e.image).join(", ")}\n` +
        "✋: Hit\n" +
        "❌: Stand"
    ).catch(console.error);
}

export const name = "blackjack";
export const help = "Put some money on the line for a game of blackjack";
export const category = HelpCategories.GAMBLING;