import { Message, DMChannel } from "discord.js";

export function run(args: string[], isDM: boolean, message: Message) {
    let current = new Date();
    message.channel.send("Pong!").catch(console.error).then(() => {
        let newDate = new Date();
        message.author.createDM().catch(console.error).then((dm: DMChannel) => {
            dm.send(newDate.getMilliseconds() - current.getMilliseconds()).catch(console.error);
        });
    })
}

export const name = "ping";