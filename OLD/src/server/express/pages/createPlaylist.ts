import express from "express";
import mainDatabase from "../../../main";

const ROUTER = express.Router();

ROUTER.get("/createPlaylist", async (req, res) => {
    let name = req.query["name"];
    let user = req.query["user"];

    if(!name || !user) return res.send("Missing fields!");

    if(typeof name !== "string" || typeof user !== "string") return res.send("Incorrect field types!");

    mainDatabase.createPlaylist(name, user, {});

    return res.send("Created playlist!");
});

export { ROUTER as createPlaylist };
