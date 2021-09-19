const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#text-message");
const $messageFormButton = document.querySelector("#submit");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight; // chieu cao nhin thay duoc cua element hien tai (tinh ca border-padding)

	// Height of messages container
	const containerHeight = $messages.scrollHeight; // tong chieu cao cua messages container

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight; // khoang cach tu vi tri hien tai den border-top cong voi vis. height
	// scrollTop tinh tu dinh cua visible part of element hien tai
	// offsetHeight la chieu cao visible cua element hien tai
	// .scrollTop + .offsetHeight = .scrollHeight ; //scrollHeight la tong chieu cao cua element ca visible va invis.

	//doan nay phai tru cho new mess height thi moi co the xay ra autoscroll,
	// neu khong co message moi (hay moi vao phong), ma chua scroll thi se apply autoscroll
	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight; // set vi tri scroll bar scrollTop bang chieu cao cua messages container
	}
};
// MESSAGE EVENT RECEIVED
socket.on("message", (message) => {
	//console.log(message);
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("H:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

//LOCATION MESSAGE RECEIVED
socket.on("locationMessage", (location) => {
	//console.log(location);
	const html = Mustache.render(locationTemplate, {
		username: location.username,
		url: location.url,
		createdAt: moment(location.createdAt).format("H:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

//
socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
});

//MESSAGE SENT FROM CLIENT
$messageForm.addEventListener("submit", (event) => {
	event.preventDefault();
	//disable Send button
	$messageFormButton.setAttribute("disabled", "disabled");

	const message = $messageFormInput.value;

	socket.emit("sendMessage", message, (acknowledgement) => {
		// Re-enable Send button
		$messageFormButton.removeAttribute("disabled");

		$messageFormInput.value = "";
		$messageFormInput.focus();

		console.log(acknowledgement);
	});
});

//SHARE LOCATION
$sendLocationButton.addEventListener("click", (event) => {
	// geolocation is not available in all browsers (browser's versions)
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported in your browser!!");
	}

	$sendLocationButton.setAttribute("disabled", "disabled");
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"sendLocation",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			(acknowledgement) => {
				$sendLocationButton.removeAttribute("disabled");
				console.log(acknowledgement);
			}
		);
	});
});

//Signal server that a user joins a chat room
socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});
