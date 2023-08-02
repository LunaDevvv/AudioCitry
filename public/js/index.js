const timeBar = document.getElementById("bar");
const volumeBar = document.getElementById("volumeBar");
const min = timeBar.min;
const max = timeBar.max;
const value = timeBar.value;

let currentSongs = [];
let songPosition = 0;

getAllSongs();
navigator.mediaSession.setActionHandler("play", async () => {
    play();
});

navigator.mediaSession.setActionHandler("pause", async () => {
    play();
});

navigator.mediaSession.setActionHandler("previoustrack", async () => {
    skipBack();
});

navigator.mediaSession.setActionHandler("nexttrack", async () => {
    skipForward();
});

timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(value-min)/(max-min)*100}%, #DEE2E6 ${(value-min)/(max-min)*100}%, #DEE2E6 100%)`

timeBar.onchange = function() {
    songElement.currentTime = timeBar.value / 100 * songElement.duration;

    this.style.background = `linear-gradient(to right, blue 0%, red ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 100%)`;
};

volumeBar.style.background = `linear-gradient(to right, blue 0%, red ${(value-min)/(max-min)*100}%, #DEE2E6 ${(value-min)/(max-min)*100}%, #DEE2E6 100%)`

volumeBar.onchange = function() {
    songElement.volume = volumeBar.value / 100;

    this.style.background = `linear-gradient(to right, blue 0%, red ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 100%)`;
};

let songElement = document.getElementsByTagName("audio")[0];   

let playing = false;
let doShuffle = false;
let doLoop = "noLoop";

function skipForward() {
    songPosition += 1;

    if(songPosition >= currentSongs.length) songPosition = 0;

    getSong();
}

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

async function getSong() {
    let songTitleElem = document.getElementById("currentSong");
    let thumbnailElem = document.getElementById("currentSongThumbnail");

    let title = currentSongs[songPosition].name;
    let channelName = currentSongs[songPosition].author;

    let data = await fetch(`/getSong?name=${title}&author=${channelName}`);

    let dataText = await data.text();

    if(dataText == "missingFields") return;

    if(dataText == "Unable to find song!") return;

    songElement.src = `/getSong?name=${title}&author=${channelName}`;

    songElement.load();

    songTitleElem.textContent = `${title} By ${channelName}`;
    thumbnailElem.src = `/getThumbnail?name=${title}&author=${channelName}`;

    navigator.mediaSession.metadata = new MediaMetadata([{
        title: title,
        artist: channelName,
        artwork: { src: `/${window.location.search}getThumbnail?name=${title}&author=${channelName}`, sizes: '512x512', type: 'image/png' }
    }]);    
    
    if(playing) songElement.play();
    else play();
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

    if(timeBar.value == 100 && doLoop == "loop" && songPosition == currentSongs.length - 1) {
        songPosition = 0;

        timeBar.value = 0;
        songElement.currentTime = 0;

        return getSong(true);
    }

    if(timeBar.value == 100 && doLoop == "singleLoop") {
        timeBar.value = 0;
        songElement.currentTime = 0;
        return;    
    }

    if(timeBar.value == 100 && songPosition != currentSongs.length - 1) {
        if(doShuffle)  {
            songPosition = Math.floor(Math.random() * (currentSongs.length - 1));
            console.log("Shuffling!");
        }
        else songPosition += 1;
        timeBar.value = 0;
        songElement.currentTime = 0;
        return getSong(true);
    }

    let duration = songElement.duration;

    if(isNaN(songElement.duration)) duration = 100;
    navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: songElement.playbackRate,
        position: songElement.currentTime
    });
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

async function play() {
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

    if(doLoop == "noLoop") {
        loopElement.style.color = "green";
        doLoop = "loop";

        return;
    }

    if(doLoop == "loop") {
        loopElement.style.color = "red";
        doLoop = "singleLoop";

        return;
    }

    loopElement.style.color = "gray";
    doLoop = "noLoop";

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
        authorElement.style.top = "10px";

        let deleteButton = document.createElement("p");
        deleteButton.innerHTML = `<ion-icon name="trash" style="width : 100%; height: 100%;"></ion-icon>`;
        deleteButton.style.position = "absolute";
        deleteButton.style.top = "-5px";
        deleteButton.style.color = "white";
        deleteButton.style.borderRadius = "50%";
        deleteButton.style.borderColor = "red";

        deleteButton.onclick = () => {
            fetch(`/deleteSong?author=${songs[i].author}&name=${songs[i].name}`);

            while(songHolder.firstChild) {
                songHolder.lastChild.remove()
            }

            holderDiv.remove();
            songs = [];
            lastPosition = -1;

            getAllSongs();
        }

        deleteButton.style.width = "25px";
        deleteButton.style.height = "25px";

        deleteButton.onmouseenter = () => {
            deleteButton.style.color = "red";
        }

        deleteButton.onmouseleave = () => {
            deleteButton.style.color = "white";
        }

        deleteButton.style.left = "calc(100% - 50px)"

        holderDiv.appendChild(imageElement);
        holderDiv.appendChild(nameElement);
        holderDiv.appendChild(authorElement);
        holderDiv.appendChild(deleteButton);
        songHolder.appendChild(holderDiv);
    }
}