import express from "express";
import mainDatabase from "../../..";
const ROUTER = express.Router();

ROUTER.get("/deleteSong", (req, res) => {
    let query = req.query;
    let author = query["author"];
    let songName = query["name"];

    if(!author || !songName) return res.send("Missing fields");
    if(typeof author !== "string" || typeof songName !== "string") return res.send("Missing fields");

    mainDatabase.deleteSong(songName, author);

    res.send("Deleted!");
});

export { ROUTER as deleteSong };