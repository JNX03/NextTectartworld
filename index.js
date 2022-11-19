var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var common = require('./common.js');


var port = process.env.PORT || 8080;
var size = common.size;
var colors = common.colors;

var displayBuffer = [];
for (var i = 0; i < size; i++) {
    var row = [];
    for (var j = 0; j < size; j++) {
        row.push(0);
    }
    displayBuffer.push(row);
}


app.use(express.static(__dirname + '/'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.emit('tiles', displayBuffer);


    socket.on('tile', function(tile) {
		if(tile != null && tile.x != null && tile.y != null && tile.color != null){
			var _x = tile.x % size;
			var _y = tile.y % size;
			var _color = tile.color % colors.length;
			displayBuffer[_y][_x] = _color;
			io.sockets.emit('tileset', {
				x: _x,
				y: _y,
				color: _color
			});
		}
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});