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

	function submitName() {
		let nameInfo;

		if (name) {
			let oldName = name;
			name = '';
			nameInfo = {name: name, oldName: oldName};
		} else {
			nameInfo = {name: ''};
		};

		while (!name) {
			name = prompt('user name:').toLowerCase();
		};

		nameInfo.name = name;
		socket.emit('message', nameInfo, function(data) {
			name = prompt(data).toLowerCase();
			submitName();
		});

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
		chatRoom.innerText = data.map(
			e =>
				"at " +
				new Date(e.timeStamp).toLocaleTimeString() + ", " +
				e.user + " says: " +
				e.body
		).join("\n");

	}

	function sendData() {
		socket.emit('message', chatBox.value.toLowerCase());
		chatBox.value = '';
		return false;
	};
};
