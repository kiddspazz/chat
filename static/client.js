window.onload = init;

function init() {
	const socket = io();

	let body = document.querySelector("body");
	let chatUsers = document.getElementById('users');
	let submitButton = document.getElementById('submitButton');
	submitButton.onclick = sendData;
	let changeUserName = document.getElementById('changeUserName');
	changeUserName.onclick = submitName;
	let chatRoom = document.createElement('p');
	body.append(chatRoom);

	let chatBox = document.getElementById('chatBox');
	chatBox.addEventListener('keyup', function(e) {
		if (e.keyCode === 13) { sendData(); }
	});

	let name = '';

	submitName();

	socket.on('message', function(data) {
		addChat(data);
	});

	socket.on('status', function(data) {
		statusUpdate(data);
	});

	socket.on('disconnect', function() {
		chatRoom.innerText = `server failed -- reload browser`;
		socket.close();
	});

	function submitName(caller) {
		let nameInfo = {name: name};

		if (!name) {
			name = nameInfo.name = prompt('user name:').toLowerCase();
		} else if (typeof(caller) === "object") {
			nameInfo.oldName = name;
			nameInfo.name = name = prompt('change user name');
		};

		socket.emit('message', nameInfo, function(data) {
			name = prompt(data).toLowerCase();
			submitName();
		});

		let label = document.getElementById('label');
		label.innerText = `${name} type here:`
		chatBox.focus();
	};

	function statusUpdate(newStatus) {
		chatUsers.innerText = (
			newStatus.map(e =>
				e.name + " joined at " +
				(new Date(e.joinTime).toLocaleTimeString())
			).join("\n")
		);
	};

	function addChat(data) {
		if (data.map) {
			chatRoom.innerText = data.map(
				e =>
					"at " +
					new Date(e.timeStamp).toLocaleTimeString() + ", " +
					e.user + " says: " +
					e.body
			).join("\n");
		}

	}

	function sendData() {
		socket.emit('message', chatBox.value.toLowerCase());
		chatBox.value = '';
		return false;
	};
};
