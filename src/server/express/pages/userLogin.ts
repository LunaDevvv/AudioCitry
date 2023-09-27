import express from "express";
import mainDatabase from "../../../main";
const ROUTER = express.Router();

ROUTER.get("/userLogin", async (req, res) => {
    let username = req.query["username"];
    let password = req.query["password"];

    if(typeof username !== "string" || typeof password !== "string") return res.send("Invalid arguments");

    let result = mainDatabase.checkPass(username, password);


    return res.send(result);
});

export { ROUTER as userLogin };
