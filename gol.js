

"use strict";

function initGrid(grid) {
    grid = [];
    for (let i = 0; i < sizeX; i++) {
        grid[i] = [];
        for (let j = 0; j < sizeY; j++) {
            grid[i][j] = 0;
        }
    }
    // hard coded glider:
    grid[0][1] = 1;
    grid[1][2] = 1;
    grid[2][0] = 1;
    grid[2][1] = 1;
    grid[2][2] = 1;

    return grid;
}

const sizeX = 20, sizeY = 20;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

const squareSize = 22; // in pixels
const offsetX = (c.width - sizeX * squareSize) / 2; // centering
const offsetY = (c.height - sizeY * squareSize) / 2;

function printGrid(grid) {

    for (let i = 0; i < grid.length; i++) {
        let ligne = "";
        for (let j = 0; j < grid[i].length; j++) {
            ctx.beginPath();
            if (grid[i][j] == 1) {
                ctx.fillStyle = "black";
                ctx.fillRect(offsetX + i * squareSize, offsetY + j * squareSize, squareSize, squareSize);
            } else {
                ctx.fillStyle = "white";
                ctx.fillRect(offsetX + i * squareSize, offsetY + j * squareSize, squareSize, squareSize);
            }
            ctx.strokeStyle = "black";
            ctx.strokeRect(offsetX + i * squareSize, offsetY + j * squareSize, squareSize, squareSize);
        }
    }
}

function stateUpdate(grid) {
    var newGrid = [];
    for (let x = 0; x < grid.length; x++) {
        newGrid[x] = grid[x].slice(); // copying with .slice(), line by line
        for (let y = 0; y < grid[x].length; y++) {
            newGrid[x][y] = cellNext(grid, x, y);
        }
    }
    if (JSON.stringify(grid) == JSON.stringify(newGrid)) {
        start = false;
    } else {
        generation++;
    }
    return newGrid;
}

function cellLiveNeighbours(grid, x, y) {
    var numberLiveNeighbours = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {

            let cellX = (x + i + grid.length) % grid.length; // WRAPAROUND
            let cellY = (y + j + grid[x].length) % grid[x].length;
            if (grid[cellX][cellY] == 1 && !(i === 0 && j === 0)) { // number of live cells without checking the considered cell
                numberLiveNeighbours++;
            }
        }
    }
    return numberLiveNeighbours;
}

function cellNext(grid, x, y) { // returns the next value that the cell should take
    var numLiveNeighbours = cellLiveNeighbours(grid, x, y);
    if (grid[x][y] === 0) { // If cell is dead
        if (numLiveNeighbours == 3) {
            return 1;
        } else { return 0 };
    } else { // cell is alive
        if (numLiveNeighbours !== 3 && numLiveNeighbours !== 2) {
            return 0; // cell will die alone and sad (or smothered by society)
        } else { return 1 }
    }
}

function cellSwitch(grid, x, y) {
    grid[x][y] = (grid[x][y] + 1) % 2; // switching between 0 and 1 with modulus %
    // console.log(grid[x][y]);
}

/**
 * Seed functions:
 */


function gridToSeed(grid) {
    let seed = BigInt(0);  // BigInt because we'll reach 10^120 (2^401 - 1 with a 20x20 grid)
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == 1) {
                seed += BigInt(Math.pow(2, j + 20 * i));
            }
        }
    }
    return seed;
}

function seedToGrid(seed) {
    let grid = [];
    for (let i = 0; i < sizeX; i++) {
        grid[i] = [];
        for (let j = 0; j < sizeY; j++) {
            grid[i][j] = 0;
        }
    }
    for (let i = grid.length - 1; i >= 0; i--) {
        for (let j = grid[i].length - 1; j >= 0; j--) {
            if (seed >= BigInt(Math.pow(2, j + 20 * i))) {
                seed = seed - BigInt(Math.pow(2, j + 20 * i));
                grid[i][j] = 1;
            }
        }
    }
    return grid;
}

/**
 *  Grouping all functions that need to be called at once:
*/

function updateAll() {
    grid = stateUpdate(grid);
    printGrid(grid);
    document.getElementById("generation").innerHTML = generation;
}

function resetAll() {
    grid = initGrid(grid);
    printGrid(grid);
    generation = 0;
    document.getElementById("generation").innerHTML = generation;
}



var start = false;

var grid = [];
var generation = 0;



/*****
 * First display of the grid!
 */


grid = initGrid(grid);

printGrid(grid);



// delay slider:

function linToLogInt(val, min, max) { // not used here, but you may use it to turn a linear slider into an exponential one
    return Math.floor((1 + (max - 1) * Math.log10(1 + 9 * (val - min) / (max - min))));
}

function linToExpInt(val, min, max) { // fancy logarithmic cnversion
    min = parseInt(min);
    max = parseInt(max);
    let valScaled = (val - min) / (max - min);
    valScaled = Math.pow(10, valScaled) - 1;
    valScaled = Math.round(valScaled * (max - min) / 9);
    valScaled += min; // This is why we need parseint: there's a risk of concatenating values otherwise
    return Math.round(valScaled);
}

var slider = document.getElementById('delai');

var maxDelai = slider.max;
var minDelai = slider.min;

var delai = linToExpInt(slider.value, minDelai, maxDelai);

slider.oninput = function () {
    delai = linToExpInt(slider.value, minDelai, maxDelai);
}



/**********************
 * Everything HTML:
 ***********************/

// Displaying the generation number:
document.getElementById("generation").innerHTML = generation;


// All event listeners on buttons:
const buttonNextStep = document.getElementById('button-next-step');
buttonNextStep.addEventListener('click', event => {
    updateAll();
})

const buttonReset = document.getElementById('button-reset');
buttonReset.addEventListener('click', event => {
    resetAll();
})

const buttonStart = document.getElementById('button-start');
buttonStart.addEventListener('click', event => {

    var myFunction = function () {

        if (start) {
            updateAll();
            setTimeout(myFunction, delai);
        }
    }
    if (!start) {
        setTimeout(myFunction, delai);
        start = true;
    }


})
const buttonStop = document.getElementById('button-stop');
buttonStop.addEventListener('click', event => {
    start = false;
})

const buttonGetSeed = document.getElementById('button-get-seed');
buttonGetSeed.addEventListener('click', event => {
    document.getElementById("display-seed").innerHTML = gridToSeed(grid).toString();
})

const buttonSendSeed = document.getElementById('button-send-seed');
buttonSendSeed.addEventListener('click', event => {
    let sentSeed = document.getElementById("seed-box").value;
    grid = seedToGrid(BigInt(document.getElementById("seed-box").value));
    printGrid(grid);
    document.getElementById("seed-box").value = "";
    generation = 0;
    document.getElementById("generation").innerHTML = generation;
})

//event listener on the canvas, to switch cells on and off
c.addEventListener('click', function (e) {
    let i = Math.floor((e.clientX - offsetX - c.offsetLeft) / squareSize);
    i = Math.min(Math.max(i, 0), sizeX - 1); // boundaries between 0 and grid size - 1
    let j = Math.floor((e.clientY - offsetY - c.offsetTop) / squareSize);
    j = Math.min(Math.max(j, 0), sizeY - 1); // boundaries between 0 and grid size - 1
    cellSwitch(grid, i, j); // inverting the clicked cell
    printGrid(grid);
}, false);


/* Interesting seeds :
Glider: 7696585588738
Oscillator: 15393162788864
Sugar bomb: 30354273811110397041125894281132852369679123255739900480800775109381042195518193666


*/
