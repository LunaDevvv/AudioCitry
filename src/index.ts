// Auto update the application if the user wants to.
import fs from "fs";
import axios from "axios";
import yauzl from "yauzl";
import { glob } from "glob";
import readline from "readline";
import path from "path";

let CURRENT_VERSION = fs.readFileSync(`${__dirname.replaceAll("\\", "/").replace("/dist", "")}/version.txt`).toString();

let readLineQuestions = readline.createInterface(process.stdin, process.stdout);

getAndExtractData().then(async() => {
    console.error = (text : string) => {}

    while(fs.existsSync("./temp/version.txt") == false) {
        console.log(false);

        await sleep(50);

        continue;
    }

    let NEW_VERSION = fs.readFileSync("./temp/version.txt").toString();

    if(NEW_VERSION == CURRENT_VERSION) {
        fs.rmdirSync("./temp", {
            recursive: true
        });

        process.exit(0);
    } else {
        readLineQuestions.question('Do you want to update? (Y/n):\n', (answer) => {
            readLineQuestions.close();
            if(answer.toLowerCase() === "n") {
                fs.rmdirSync("./temp", {
                    recursive: true
                });
                return;
            }

            glob("./temp/**/*").then((files) => {
                
                for(let i = 0; i < files.length; i++) {
                    if(files[i].includes("files.zip")) continue;
                    let file = files[i].replace("temp\\", "");

                    console.log(file);

                    if(fs.lstatSync(files[i]).isDirectory()) {
                        if(!fs.existsSync(files[i])) fs.mkdirSync(files[i]);
                        continue;                    
                    }
                
                    let dirName = path.dirname(file);
                
                    if(!fs.existsSync(dirName)) fs.mkdirSync(dirName);
                
                    let fileData = fs.readFileSync(files[i]).toString();
                
                    fs.writeFileSync(file, fileData);
                }

                fs.rmdirSync("./temp", {
                    recursive: true
                });
            });
        })
    }
})

async function getAndExtractData() {
    axios.get(
        `https://api.github.com/repos/lunadevvv/audiocity/releases/latest`
    ).then(async (response) => {
        
        // Wipe old temp files.
        if(fs.existsSync("./temp")) {
            fs.rmdirSync("./temp", {
                recursive: true
            });
        }
        fs.mkdirSync("./temp");

    
        let data = await axios.get(response.data.zipball_url, {
            responseType: "stream"
        });
    
    
        let fileStream = fs.createWriteStream("./temp/files.zip")
    
        data.data.pipe(fileStream);
    
        fileStream.on("close", async () => {
            let firstDir = true;
            let baseDirName = "";
    
            try {
                yauzl.open("./temp/files.zip", {
                    lazyEntries : true
                }, (err, zipFile) => {
                    if(err) console.error(err);
                    zipFile.readEntry();
        
                    zipFile.on("entry", (entry) => {
                        if(firstDir == true) {
                            firstDir = false;
                            baseDirName = entry.fileName;
                            zipFile.readEntry();
                            return;
                        }
    
                        if(/\/$/.test(entry.fileName)) {
                            fs.mkdirSync("./temp/" + entry.fileName.replace(baseDirName, ""));
                            zipFile.readEntry();
                            return;
                        }
    
                        zipFile.openReadStream(entry, (err, readStream) => {
                            if(err) console.error(err);
    
                            readStream.pipe(fs.createWriteStream("./temp/" + entry.fileName.replace(baseDirName, "")));
                        })

                        zipFile.readEntry();
                    });
                });
            } catch(err) {
                console.log(err);
            }
        });
    });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));