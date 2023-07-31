import express from "express";
import { baseDir } from "../main";
const ROUTER = express.Router();

ROUTER.get("/", (req, res) => {
    res.sendFile(`${baseDir}/public/html/index.html`);
});

export { ROUTER as index_page };