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
import { createHash } from "crypto";

const oauth = new DiscordOauth2();

const hash = createHash("sha256");

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser(COOKIE_SIGNATURE));

const restRouter = express.Router();


const webRouter = express.Router();

webRouter.get("/login", async (req, res) => {
    let rand = randomBytes(15).toString("hex");

    while(await hasOAuthUser(doHash(rand))) {
        rand = randomBytes(15).toString("hex");
    }

    res.cookie("state", rand, {signed: true, maxAge: 900000, path: "/"});
    if(req.query.returnPage) {
        res.cookie("returnPage", req.query.returnPage, {maxAge: 900000, path: "/"});
    }
    res.redirect(createAuthURL(["identify", "guilds"], rand));
});

webRouter.get("/callback", async (req, res) => {
    if(req.query == {}) return res.status(400).send("missing query parameters");
    if(req.query.code === undefined) return res.status(400).send("missing code");
    if(req.query.state === undefined) return res.status(400).send("missing state");
    if(req.signedCookies == {}) return res.status(400).send();
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
        user.state = doHash(req.signedCookies.state);
        try {
            await storeOAuthUser(user);
            console.log("stored");
            return defaultRedirect(req, res);
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
    return res.status(200).send({signed_in:await checkSignedIn(req, res)});
});

// Create more endpoints for use through the main website


app.use("/api", restRouter);
app.use("/internal", webRouter);

async function checkSignedIn(req: express.Request, res: express.Response) {
    if(req.query.state) {
        return await hasOAuthUser(doHash(req.query.state as string));
    } else return false;
}

async function defaultRedirect(req: express.Request, res: express.Response) {
    if(req.query.returnPage) {
        return res.redirect(req.query.returnPage as string);
    }
    if(req.cookies.returnPage) {
        res.cookie("returnPage", "", {maxAge: 0});
        return res.redirect(req.cookies.returnPage as string);
    }
    return res.redirect("/dash");
}

function doHash(data: string): string {
    return hash.update(data).digest("hex");
}

export default function listen() {
    console.log(process.env.ECONOMY_PORT || 3000);
    app.listen(process.env.ECONOMY_PORT || 3000, () => console.log("Express started"));
}