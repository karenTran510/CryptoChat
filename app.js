var express = require('express');
var	app = express();
var fs = require('fs');
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
var auth = require('http-auth');
var basic = auth.basic({
    realm: "No un-authorized access!!",
    file: __dirname + "/pwd/users.htpasswd" // gevorg:gpass, Sarah:testpass ... 
});

var server = require('https').createServer(options, app).listen(3000, function(){
    console.log("Https server started on port 3000");
});
var	io = require('socket.io').listen(server);
var	nicknames = [];
var nickname;

app.use(express.static(__dirname + '/scripts'));
app.use(auth.connect(basic));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
    nickname = req.user;
});


io.on('connection', function(socket){ 
    socket.on('connected', function(){
        socket.nickname = nickname
        nicknames.push(socket.nickname);
        updateNicknames();      
    });

	socket.on('send message', function(data){
		io.emit('new message', {msg: data, nick: socket.nickname});
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
    
    function updateNicknames(){
		io.emit('usernames', nicknames);
	}
});