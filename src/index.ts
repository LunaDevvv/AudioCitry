import database from "./database";
import runServer from "./server/server";
import dotenv from "dotenv";

//Version formatting
// {Major Releases}{Large Updates}{Bug fixes}
const CURRENT_VERSION = "0.1.0"

let runType = "server";

let PORT : number | string = 5000;

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

const mainDatabase = new database(`${__dirname.replaceAll("\\", "/").replace("dist", "")}database`);

if(runType == "server") {
    runServer(NGROK_TOKEN);
}

export default mainDatabase;
export { PORT }