const timeBar = document.getElementById("bar");
const min = timeBar.min;
const max = timeBar.max;
const value = timeBar.value;

timeBar.style.background = `linear-gradient(to right, blue 0%, red ${(value-min)/(max-min)*100}%, #DEE2E6 ${(value-min)/(max-min)*100}%, #DEE2E6 100%)`

timeBar.oninput = function() {
  this.style.background = `linear-gradient(to right, blue 0%, red ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 ${(this.value-this.min)/(this.max-this.min)*100}%, #DEE2E6 100%)`
};


let playing = false;
let doShuffle = false;
let doLoop = false;




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
        return;
    }

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