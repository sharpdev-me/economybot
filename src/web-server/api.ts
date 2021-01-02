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

import * as express from "express";
import * as cookieParser from "cookie-parser";
import { COOKIE_SIGNATURE } from "../util/constants";
import { createAuthURL } from "../util/oauth_builder";
import DiscordOauth2 = require("discord-oauth2");
import { randomBytes } from "crypto";
import { hasOAuthUser, storeOAuthUser } from "../util/database";

const oauth = new DiscordOauth2();

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser(COOKIE_SIGNATURE));

const restRouter = express.Router();


const webRouter = express.Router();

webRouter.get("/login", async (req, res) => {
    if(req.signedCookies !== undefined && req.signedCookies.state !== undefined) {
        if(hasOAuthUser(req.signedCookies.state)) {
            return res.redirect("/dashboard");
        }
    }
    let rand = randomBytes(15).toString("hex");

    while(await hasOAuthUser(rand)) {
        rand = randomBytes(15).toString("hex");
    }

    res.cookie("state", rand, {signed: true, maxAge: 900000, path: "/"});
    res.redirect(createAuthURL(["identify", "guilds"], rand));
});

webRouter.get("/callback", async (req, res) => {
    if(req.query === null) return res.status(400).send("missing query parameters");
    if(req.query.code === undefined) return res.status(400).send("missing code");
    if(req.query.state === undefined) return res.status(400).send("missing state");
    if(req.signedCookies === null) return res.status(400).send();
    if(req.signedCookies.state === undefined) return res.status(400).send();
    if(req.query.state != req.signedCookies.state) return res.status(400).send();
    
    try {
        let result = await oauth.tokenRequest({
            clientId: process.env.ECONOMY_CLIENT,
            clientSecret: process.env.ECONOMY_SECRET,

            code: String(req.query.code),
            scope: "identify guilds",
            grantType: "authorization_code",

            redirectUri: process.env.OAUTH_CALLBACK
        });

        let user: any = await oauth.getUser(result.access_token);
        user.access_token = result.access_token;
        user.refresh_token = result.refresh_token;
        user.state = req.signedCookies.state;
        try {
            await storeOAuthUser(user);
            return res.redirect("/dashboard");
        } catch(err) {
            console.error(err);
            return res.status(500).send();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send();
    }
});

webRouter.get("/check_signed_in", async (req, res) => {
    if(req.signedCookies === null || req.signedCookies.state === undefined || !await hasOAuthUser(req.signedCookies.state)) return res.status(200).send({signed_in:false});
    return res.status(200).send({signed_in:true});
});

// Create more endpoints for use through the main website


app.use("/api", restRouter);
app.use("/internal", webRouter);

export default function listen() {
    console.log(process.env.ECONOMY_PORT || 3000);
    app.listen(process.env.ECONOMY_PORT || 3000, () => console.log("Express started"));
}