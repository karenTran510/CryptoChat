var express = require('express');
var	app = express();
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

var server = require('https').createServer(options, app).listen(3000, function(){
    console.log("Https server started");
});
var	io = require('socket.io').listen(server);
var nickname;
var users = [];

app.use(express.static(__dirname + '/scripts'));
app.use(auth.connect(basic));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
    nickname = req.user;
});


io.on('connection', function(socket){
    socket.on('connected', function(data){
        socket.nickname = nickname;
        users.push({id: socket.id, nick: socket.nickname, pubKey: data});
        console.log(users);
        console.log('-----------------\n');
        updateUsers();      
    });
    
    socket.on('requestKeys', function(){
       socket.emit('getKeys', users);
    });

	socket.on('send message', function(data){
		io.emit('new message', {msg: data, nick: socket.nickname});
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		users.splice(indexOfID(users, socket.id), 1);
		updateUsers();
        console.log(users);
        console.log('-----------------\n');
	});
    
    function updateUsers(){
		io.emit('users', users);
	}
    
    function indexOfID(array, id) {
        for (var i=0; i<array.length; i++) {
            if (array[i].id==id) return i;
            }
        return -1;
    }
});