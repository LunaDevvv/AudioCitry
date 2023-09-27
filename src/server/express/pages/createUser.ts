import express from "express";
import mainDatabase from "../../../main";
const ROUTER = express.Router();

ROUTER.get("/createUser", async (req, res) => {
    let username = req.query["username"];
    let password = req.query["password"];

    if(typeof username !== "string" || typeof password !== "string") return res.send("Invalid arguments");

    let result = mainDatabase.createUser(username, password);

    if(result == "user exists!") return res.send("ERROR: User exists");

    return res.send("Successfully created user!");

});

export { ROUTER as createUser };
