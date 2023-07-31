import express from "express";
import { PORT } from "../..";

import { index_page } from "./pages/index";


let app = express();

let baseDir = `${__dirname.replaceAll("\\", "/").replace("dist/server/express", "")}`;

export default function createWebServer(NGROK_URL : string | undefined) {
    let NGROK_TEXT = "";

    app.use("/public", express.static(baseDir + "/public"))

    if(NGROK_URL) {
        NGROK_TEXT = `\nAudioCity NGROK link is ${NGROK_URL}`;
    }

    app.use(index_page);

    app.listen(PORT, () => {
        console.log(`@###############################################@
AudioCity is running at http://localhost:${PORT}/ ${NGROK_TEXT}
@###############################################@`);
    });
}

export { baseDir, PORT };