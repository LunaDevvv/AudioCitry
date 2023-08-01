import express from "express";
import mainDatabase from "../../..";
const ROUTER = express.Router();

ROUTER.get("/downloadSong", async (req, res) => {
    let query = req.query;
    let link = query["link"];

    if(!link) return res.send("Missing fields");
    if(typeof link !== "string") return res.send("Missing fields");

    let song = await mainDatabase.saveSong(link);

    if(song) return res.send("downloaded!");
    if(!song) return res.send("Not a valid yt link, Or failed to download");
});

export { ROUTER as downloadSong };