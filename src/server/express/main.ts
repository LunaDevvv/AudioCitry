import express from "express";
import { PORT } from "../..";

import { indexPage } from "./pages/index";
import { getSong } from "./pages/getSong";
import { downloadSong } from "./pages/downloadSong";
import { getAllSongs } from "./pages/getAllSongs";
import { getThumbnail } from "./pages/getThumbnail";
import { deleteSong } from "./pages/deleteSong";


let app = express();

let baseDir = `${__dirname.replaceAll("\\", "/").replace("dist/server/express", "")}`;

export default function createWebServer(NGROK_URL : string | undefined) {
    let NGROK_TEXT = "";

    app.use("/public", express.static(baseDir + "/public"));

    if(NGROK_URL) {
        NGROK_TEXT = `\nAudioCity NGROK link is ${NGROK_URL}`;
    }

    app.use(indexPage);
    app.use(getSong);
    app.use(getAllSongs);
    app.use(getThumbnail);
    app.use(downloadSong);
    app.use(deleteSong);

    app.listen(PORT, () => {
        console.log(`@###############################################@
AudioCity is running at http://localhost:${PORT}/ ${NGROK_TEXT}
@###############################################@`);
    });
}

export { baseDir, PORT };