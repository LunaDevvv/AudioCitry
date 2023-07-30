let runType = "server";

for(let i = 0; i < process.argv.length; i++) {
    if(process.argv[i] == "client") {
        throw new Error("Client not currently in development.");
    }

    if(process.argv[i] == "server") {
        runType = "server";
    }
}

