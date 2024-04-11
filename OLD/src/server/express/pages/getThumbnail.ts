import express from "express";
import mainDatabase from "../../../main.js";
const ROUTER = express.Router();

ROUTER.get("/getThumbnail", (req, res) => {
    let query = req.query;
    let author = query["author"];
    let songName = query["name"];

    if(!author || !songName) return res.send("Missing fields");
    if(typeof author !== "string" || typeof songName !== "string") return res.send("Missing fields");

    let song = mainDatabase.getSong(songName, author);

    if(!song?.thumbnailLocation) {
        return res.send("Unable to find song!");
    }

    res.sendFile(song.thumbnailLocation);
});

export { ROUTER as getThumbnail };