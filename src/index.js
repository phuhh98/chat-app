const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages.js");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users.js");

const PORT = process.env.PORT || 3000;
const SysUsername = "System";

const app = express();
const server = http.createServer(app);
const io = socketio(server); // socketio server expected to receive raw http server created by node http(s) modules

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// this will establish the connect with the client and make it persist until the connection closed
io.on("connection", (socket) => {
	socket.on("join", ({ username, room }, acknowledgement) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return acknowledgement(error);
		}
		socket.join(user.room);

		socket.emit("message", generateMessage(SysUsername, "Welcome!"));
		socket.to(user.room).emit("message", generateMessage(SysUsername, `${user.username} has join!`));
		// socket.emit() :: emit event to a specific socket
		// io.emit(), socket.broadcast.emit() :: emit event to all rooms / other sockets
		//socket.to(room).emit(), io.to().emit() :: emit event to a specific room

		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
		acknowledgement();
	});

	socket.on("sendMessage", (message, acknowledgement) => {
		const filter = new Filter();
		const user = getUser(socket.id);
		if (filter.isProfane(message)) {
			io.to(user.room).emit("message", generateMessage(user.username, filter.clean(message)));
			return acknowledgement("Profanity is not allowed!!");
		}

		io.to(user.room).emit("message", generateMessage(user.username, message));
		acknowledgement("Message delivered!!");
	});

	socket.on("sendLocation", (location, acknowledgement) => {
		const user = getUser(socket.id);

		io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));

		acknowledgement("Location shared!");
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit("message", generateMessage(SysUsername, `${user.username} has left!!`));

			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

//refactor to use server instance of httpServer not from express one
server.listen(PORT, () => {
	console.log(`Application serves on port ${PORT}`);
});
