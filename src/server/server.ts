import createWebServer from "./express/main";
import ngrok from "ngrok";

import { PORT } from "../main";

export default async function runServer(NGROK_TOKEN : string | undefined) {
    let NGROK_URL : string | undefined = undefined;
    if(NGROK_TOKEN) {
        NGROK_URL = await ngrok.connect({ authtoken : NGROK_TOKEN, addr: PORT });
    }

    createWebServer(NGROK_URL);
}