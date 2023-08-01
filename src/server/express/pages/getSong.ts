import express from "express";
import mainDatabase from "../../..";
const ROUTER = express.Router();

ROUTER.get("/getSong", (req, res) => {
    let query = req.query;
    let author = query["author"];
    let songName = query["name"];

    if(!author || !songName) return res.send("Missing fields");
    if(typeof author !== "string" || typeof songName !== "string") return res.send("Missing fields");

    let song = mainDatabase.getSong(songName, author);

    if(!song?.mediaLocation) return res.send("Unable to find song!");

    res.sendFile(song?.mediaLocation);
});

export { ROUTER as getSong };