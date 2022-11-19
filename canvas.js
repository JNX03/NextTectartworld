window.onload = init;

//Rendering element
var canvas = null;

//Render context
var ctx = null;

//display matrix offset
var offsetX = 0.0;
var offsetY = 0.0;

//Mouse event tracker
var mouseDown = false;

//If click resulted in drag
var drag = false;

//Dimensions of a single tile
var tileDimension = 32.0;

//Array of all colors to draw with
var colors = common.colors;

//Which color is selected to draw with
var selectedColor = 0;

//Height of a color selection square
var squareHeight = common.squareHeight;

//Mouses position relative to the canvas
var mousePos = {
    x: 0.0,
    y: 0.0
}

//MAx size of tile matrix
var size = common.size;

//buffer holding the color of every pixel
var displayBuffer = [];
for (var i = 0; i < size; i++) {
    var row = [];
    for (var j = 0; j < size; j++) {
        row.push(0);
    }
    displayBuffer.push(row);
}

//Socket server connection
var socket = io();


function init() {
    console.log("Canvas.io client init");
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.font = "15px Arial";
    squareHeight = canvas.height / colors.length

    //Get CSS color codes
    for (var i = 0; i < colors.length; i++) {
        colors[i] = numToHex(colors[i])
    }

    canvas.addEventListener('mousemove', mouseMoveListener, false);
    canvas.addEventListener('mousedown', mouseDownListener, false);
    window.addEventListener("mouseup", mouseUpListener, false);

    colorPickerBuffer = createRenderBuffer();
    tilesBuffer = createRenderBuffer();


    //Get initial display matrix from server
    socket.on('tiles', function(buffer) {
        displayBuffer = buffer;
    });

    //Update displayBuffer when a user sets a tile
    socket.on('tileset', function(tile) {
        displayBuffer[tile.y][tile.x] = tile.color;
    });


    //initialize game loop
    setInterval(update, 1000.0 / 60.0);
}

/////////////////////////////////////////////
//////////////// EVENTS /////////////////////
/////////////////////////////////////////////

function mouseMoveListener(evt) {
    var tempPos = getMousePos(evt);
    mousePos.x = tempPos.x;
    mousePos.y = tempPos.y;
}

//first positions when mouse down
var firstX = 0;
var firstY = 0;

function mouseDownListener(evt) {
    mouseDown = true
    firstX = mousePos.x;
    firstY = mousePos.y;
    colorSelectorClicked();
}

function mouseUpListener(evt) {
    mouseDown = false;
    if (!drag && mousePos.x > squareHeight)
        tileClick();
    drag = false;
}

function colorSelectorClicked() {
    if (mousePos.x <= squareHeight) {
        selectedColor = Math.floor(colors.length * (mousePos.y / canvas.height));
    }
}


var boundaries = 0;

function scrollTiles() {
    if (mousePos.x > squareHeight && mouseDown) {
        var dx = mousePos.x - firstX;
        var dy = mousePos.y - firstY;
        offsetX -= dx;
        offsetY -= dy;
        firstX = mousePos.x;
        firstY = mousePos.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            drag = true;
        }
    }
    if (offsetX + boundaries < 0)
        offsetX = -boundaries;
    if (offsetY + boundaries < 0)
        offsetY = -boundaries;
}

function tileClick() {
    var tile = {
        x: Math.floor(((mousePos.x - squareHeight) + offsetX) / tileDimension),
        y: Math.floor((mousePos.y + offsetY) / tileDimension),
        color: selectedColor
    }
    socket.emit('tile', tile);
}



/////////////////////////////////////////////
//////////////// RENDERS ////////////////////
/////////////////////////////////////////////


var colorPickerBuffer = null;
//Render the color picker squares
function renderColorPicker() {
    var buffer_ctx = colorPickerBuffer.buffer_ctx;
    buffer_ctx.clearRect(0, 0, canvas.width, canvas.height);
    buffer_ctx.beginPath();
    // COLOR SQAURES
    var currentY = 0;

    for (var i = 0; i < colors.length; i++) {
        buffer_ctx.fillStyle = colors[i];
        buffer_ctx.fillRect(0, currentY, squareHeight, squareHeight);
        currentY += squareHeight;
    }

    // DIVIDER
    buffer_ctx.fillStyle = '#000000';
    buffer_ctx.lineWidth = 3;
    buffer_ctx.moveTo(squareHeight, 0);
    buffer_ctx.lineTo(squareHeight, canvas.height);
    buffer_ctx.stroke();

    // SELECTED COLOR
    buffer_ctx.lineWidth = 5;
    buffer_ctx.strokeRect(0, selectedColor * squareHeight, squareHeight, squareHeight);

    // Draw onto main canvas
    ctx.drawImage(colorPickerBuffer, 0, 0);
}

var tilesBuffer = null;

function renderTiles() {
    if (displayBuffer) {
        var buffer_ctx = tilesBuffer.buffer_ctx;
        buffer_ctx.clearRect(0, 0, canvas.width, canvas.height);
        buffer_ctx.beginPath();

        var startX = Math.floor(offsetX / tileDimension);
        var startY = Math.floor(offsetY / tileDimension);
        var currentX = 0;
        var currentY = 0;
        var width = (canvas.width - squareHeight) / tileDimension;
        var height = canvas.height / tileDimension;

        for (var row = startY; row < startY + height + 1; row++) {
            currentX = squareHeight;
            for (var col = startX; col < startX + width + 1; col++) {
                buffer_ctx.fillStyle = colors[displayBuffer[row][col]];
                buffer_ctx.fillRect(
                    Math.round(currentX - (offsetX % tileDimension)),
                    Math.round(currentY - (offsetY % tileDimension)),
                    tileDimension,
                    tileDimension
                );
                currentX += tileDimension;
            }
            currentY += tileDimension;
        }

        ctx.drawImage(tilesBuffer, 0, 0);
    }
}


/////////////////////////////////////////////
//////////////// UTILS /////////////////////
/////////////////////////////////////////////

//Creates a render buffer
function createRenderBuffer() {
    var buffer = document.createElement('canvas');
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    buffer.buffer_ctx = buffer.getContext('2d');
    return buffer;
}

//Converts a color numerical value to a color code hex value
var numToHex = common.numToHex;

//Converts a hex string value to a color numerical value
var hexToNum = common.hexToNum;

//Gets mouse position relative to the canvas
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//Checks if point intersects a rectangle
// a and be require x, y, width, height
function intersects(a, b) {
    var x = Math.max(a.x, b.x);
    var num1 = Math.min(a.x + a.width, b.x + b.width);
    var y = Math.max(a.Y, b.Y);
    var num2 = Math.min(a.y + a.height, b.y + b.height);
    if (num1 >= x && num2 >= y)
        return true;
    else
        return false;
}



/////////////////////////////////////////////
//////////////// UPDATE /////////////////////
/////////////////////////////////////////////

//Update game logic 60fps fixed, no delta time
function update() {

    //RENDER
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    renderTiles();
    renderColorPicker();
    ctx.fillText("x: " + mousePos.x + " y: " + mousePos.y, canvas.width - 100, 15);
    ctx.fillText(" oX: " + offsetX + " oY: " + offsetY, canvas.width - 100, 35);
    //LOGIC
    scrollTiles();
}