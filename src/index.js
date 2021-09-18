const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

//Serve public folder
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// app.get("/", (req, res) => {
// 	res.status(200).send("Server is up");
// });

app.listen(PORT, () => {
	console.log(`Application serves on port ${PORT}`);
});
