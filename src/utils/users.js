const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
	//Clean data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	//Validate data
	if (!username || !room) {
		return {
			error: "username and room are required!!",
		};
	}

	//Check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	//Validate username
	if (existingUser) {
		return {
			error: "username is in use!!",
		};
	}

	//Store user
	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
	return users.filter((user) => {
		return user.room === room.toString().trim().toLowerCase();
	});
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
