var express = require('express');
var app = express();
var fs = require('fs');
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
var auth = require('http-auth');
var basic = auth.digest({
    realm: "No un-authorized access",
    file: __dirname + "/pwd/users.htpasswd"
});

var server = require('https').createServer(options, app).listen(443, function () {
    console.log("Https server started");
});
var io = require('socket.io').listen(server);
var nickname;
var users = [];

app.use(express.static(__dirname + '/scripts'));
app.use(auth.connect(basic));

function indexOfNick(nick) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].nick == nick) return i;
    }
    return -1;
}

app.get('/', function (req, res) {
    if (indexOfNick(req.user) == -1) {
        res.sendFile(__dirname + '/index.html');
        nickname = req.user;
    } else {
        res.send("User already connected, try again!");
    }
});


io.on('connection', function (socket) {
    socket.emit('username', nickname);
    socket.on('connected', function (data) {
        socket.nickname = nickname;
        users.push({
            id: socket.id,
            nick: socket.nickname,
            pubKey: data
        });
        updateUsers();
        console.log(Date);
        console.log(socket.nickname + " connected!");
        usersOnline();
    });

    socket.on('requestKeys', function () {
        socket.emit('getKeys', users);
    });

    socket.on('send message', function (data) {
        io.emit('new message', {
            msg: data,
            nick: socket.nickname
        });
    });

    socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        users.splice(indexOfID(socket.id), 1);
        updateUsers();
        console.log(Date);
        console.log(socket.nickname + " disconnected!");
        usersOnline();
    });

    function updateUsers() {
        io.emit('users', users);
    }

    function indexOfID(id) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == id) return i;
        }
        return -1;
    }

    function usersOnline() {
        var online = "";
        for (var i = 0; i < users.length; i++) {
            online += users[i].nick + ", ";
        }
        console.log("Users online: " + online.slice(0, -2) + "\n----------------");
    }
});
