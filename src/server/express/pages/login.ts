import express from "express";
import { baseDir } from "../main";

let ROUTER = express.Router();

ROUTER.get("/login", (req, res) => {
    res.sendFile(`${baseDir}/public/html/login.html`);
});

export { ROUTER as loginPage };
