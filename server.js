#!/user/bin/env nodejs
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIO = require('socket.io');
const express = require('express');

const app = express();
const server = http.Server(app);
const port = 8081;

server.listen(port, function() {
	console.log(`Chat server listening on ${port}`);
});

app.use(express.static('static'));
app.get('/index', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

let io = socketIO(server);
let users = [];
let messages = [];

io.on('connection', function(socket) {
	socket.on('message', function(data, fn) {
		send(data, socket, fn);
	});

	socket.on('disconnect', function () {
		if (user = users.find(user => user.id === socket.id)) {
			let name = user.name;
			let goodbye = `user ${name} has left`;
			user.active = false;
			io.emit('message', goodbye);
			io.emit('status', users.filter(user => user.active));
		};
	});
});

function send(data, socket, fn) {
	let user = users.find(user => user.id === socket.id);

	if (data.name) {
		if (!(uniqueName(data.name, users))) {
			fn('name already taken--choose user name:');
			return;
		}

		if (!user) {
			addNewUser(socket.id, data.name);
			return;
		}

		if (data.oldName) {
			changeName(data, user)
			return;
		}
	}

	if (data.length > 0) {
		messages.unshift({
			body: data, user: user.name, timeStamp: new Date()
		});

		io.emit('message', messages.slice(0, 20));
	}
}

function uniqueName(name, users) {
	if (name === '' || name === null) {return false};
	for (let user of users) {
		if (user.userName === name && user.active) {return false};
	};
	return true;
}

function addNewUser(id, name) {
	users.push({
		id: id,
		name: name,
		joinTime: new Date(),
		active: true
	});

	io.emit('status', users.filter(user => user.active));
	io.emit('message', messages.slice(0, 20));
}

function changeName(data, user) {
	user.name = data.name;
	let oldName = data.oldName;

	messages.unshift({
		body: `${oldName} change their name to ${user.name}`,
		user: 'THE SERVER',
		timeStamp: new Date()
	});

	io.emit('message', messages.slice(0, 20));
	io.emit('status', users.filter(user => user.active));
}
