const timeBar = document.getElementById("bar");
const min = timeBar.min;
const max = timeBar.max;
const value = timeBar.value;

let currentSongs = [];
let songPosition = 0;

getAllSongs();

timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(value-min)/(max-min)*100}%, #DEE2E6 ${(value-min)/(max-min)*100}%, #DEE2E6 100%)`

timeBar.onchange = function() {
    songElement.currentTime = timeBar.value / 100 * songElement.duration;

    this.style.background = `linear-gradient(to right, blue 0%, red ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 100%)`;
};

let songElement = document.getElementsByTagName("audio")[0];   

let playing = false;
let doShuffle = false;
let doLoop = false;

function skipBack() {
    if(Math.floor(timeBar.value) !== 0) {
        timeBar.value = 0;
        songElement.currentTime = 0;
        timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 100%)`;
    } else {
        songPosition -= 1;

        if(songPosition == -1) {
            songPosition = currentSongs.length - 1;
            return getSong();
        }

        return getSong();
    }
}

async function getSong(autoChange = false) {
    if(playing && !autoChange) play();

    console.log(currentSongs[songPosition]);

    let title = currentSongs[songPosition].name;
    let channelName = currentSongs[songPosition].author;

    let data = await fetch(`/getSong?name=${title}&author=${channelName}`);

    let dataText = await data.text();

    if(dataText == "missingFields") return console.log(dataText);

    if(dataText == "Unable to find song!") return console.log(dataText);

    songElement.src = `/getSong?name=${title}&author=${channelName}`;

    songElement.load();

    if(autoChange) songElement.play();
}

songElement.onloadeddata = () => {
    let remainingDuration = document.getElementById("remainingDuration");

    let durationMinutes = Math.floor(Math.floor(songElement.duration)/60);

    let durationSeconds = Math.floor(songElement.duration) % 60;

    remainingDuration.textContent = `${durationMinutes}:${durationSeconds}`;

    timeBar.value = 0;
    timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 100%)`;
}

songElement.addEventListener("timeupdate", (ev) => {
    let currentTimeElement = document.getElementById("realTime");
    let durationMinutes = Math.floor(Math.floor(songElement.currentTime)/60);

    let durationSeconds = Math.floor(songElement.currentTime) % 60;

    if(durationSeconds < 10) {
        durationSeconds = `0${durationSeconds}`;
    }

    currentTimeElement.textContent = `${durationMinutes}:${durationSeconds}`;

    let totalTimePercentage = songElement.currentTime / songElement.duration;

    timeBar.value = totalTimePercentage * 100;

    timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 ${(timeBar.value-timeBar.min)/(timeBar.max-timeBar.min)*100}%, #DEE2E6 100%)`;

    if(timeBar.value == 100 && doLoop && songPosition == currentSongs.length) {
        songPosition = 0;

        return getSong(true);
    }

    if(timeBar.value == 100 && songPosition != currentSongs.length) {
        if(doShuffle) songPosition = Math.floor(Math.random() * (currentSongs.length - 1)) ;
        else songPosition += 1;
        timeBar.value = 0;
        return getSong(true);
    }

    if(timeBar.value == 100) {
        return play();
    }
});

document.getElementById("pause").style.visibility = 'hidden';

function shuffle() {
    let shuffleElement = document.getElementById("shuffleMix");

    if(shuffleElement.style.color != "green") {
        shuffleElement.style.color = "green";
        doShuffle = true;

        return;
    }

    shuffleElement.style.color = "gray";
    doShuffle = false;
}

function play() {
    if(playing == false) {
        document.getElementById("pause").style.visibility = 'visible';
        document.getElementById("play").style.visibility = 'hidden';
        playing = true;
        songElement.play();
        return;
    }

    songElement.pause();
    document.getElementById("pause").style.visibility = 'hidden';
    document.getElementById("play").style.visibility = 'visible';
    playing = false;
}

function loop() {
    let loopElement = document.getElementById("loopButton");

    if(loopElement.style.color != "green") {
        loopElement.style.color = "green";
        doLoop = true;

        return;
    }

    loopElement.style.color = "gray";
    doLoop = false;

    return;
}

let downloadLink = document.getElementById("ytDownload");

downloadLink.addEventListener("change", async () => {
    let res = await fetch(`/downloadSong?link=${downloadLink.value}`);

    downloadLink.value = await res.text();

    getAllSongs();
});

let lastPosition = -1;

async function getAllSongs() {
    let songHolder = document.getElementById("songHolder");
    let songsData = await (await fetch("/getAllSongs")).text();

    let { songs } = JSON.parse(songsData);

    currentSongs = songs;

    for(let i = 0; i < songs.length; i++) {
        if(i <= lastPosition) continue;


        lastPosition = i;
        let holderDiv = document.createElement("div");

        holderDiv.style.width = "calc(100% - 50px)";
        holderDiv.style.backgroundColor = "rgb(20, 20, 20)";

        holderDiv.onmouseenter = () => {
            holderDiv.style.backgroundColor = "gray";         
        }

        holderDiv.onmouseleave = () => {
            holderDiv.style.backgroundColor = "rgb(20, 20, 20)";
        }

        holderDiv.onclick = () => {
            songPosition = i;
            getSong();
        }

        holderDiv.style.position = "relative";
        holderDiv.style.borderRadius = "50px";

        holderDiv.style.marginTop = "5px";

        holderDiv.style.height = "50px";

        holderDiv.style.left = "25px";

        let thumbnail = await (await fetch(`/getThumbnail?name=${songs[i].name}&author=${songs[i].author}`)).text();

        let imageElement = document.createElement("img");
        imageElement.src = `https://miro.medium.com/v2/resize:fit:1400/1*n3TfCNa0f0BFKnkwX4XgrA.jpeg`;

        if(thumbnail !== 'Missing fields' && thumbnail !== 'Unable to find song!') {
            imageElement.src = `/getThumbnail?name=${songs[i].name}&author=${songs[i].author}`;
        }

        imageElement.width = "75";
        imageElement.style.borderRadius = "15px";
        imageElement.style.position = "relative";
        imageElement.style.left = "20px";
        imageElement.style.top = "4px";


        let nameElement = document.createElement("p");

        nameElement.textContent = songs[i].name;

        nameElement.style.textAlign = "center";
        nameElement.style.color = "white";
        nameElement.classList.add("center");
        nameElement.style.top = "-15px";

        let authorElement = document.createElement("p");

        authorElement.textContent = songs[i].author;

        authorElement.style.textAlign = "center";
        authorElement.style.color = "white";
        authorElement.classList.add("center");
        authorElement.style.top = "0px";

        
        holderDiv.appendChild(imageElement);
        holderDiv.appendChild(nameElement);
        holderDiv.appendChild(authorElement);
        songHolder.appendChild(holderDiv);
    }
}