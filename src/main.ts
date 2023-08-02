import database from "./database";
import runServer from "./server/server";
import dotenv from "dotenv";

const mainDatabase = new database(`${__dirname.replaceAll("\\", "/").replace("dist", "")}database`);
let PORT : number | string = 5000;

let runType = "server";


let NGROK_TOKEN : string | undefined= undefined;

for(let i = 0; i < process.argv.length; i++) {
    if(process.argv[i] == "client") {
        throw new Error("Client not currently in development.");
    }

    if(process.argv[i] == "server") {
        runType = "server";
    }

    if(process.argv[i] == "--use-ngrok") {
        dotenv.config();

        NGROK_TOKEN = process.env.NGROK_TOKEN;
    }

    if(process.argv[i] == "--port") {
        PORT = process.argv[i + 1];

        i += 1;
    }
}


if(runType == "server") {
    runServer(NGROK_TOKEN);
}

export default mainDatabase;

export { PORT }