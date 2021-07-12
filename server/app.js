const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 4193;
const { v4: uuidV4 } = require("uuid");
const { PeerServer } = require("peer")

const app = express();
app.use(cors());

const server = require("http").Server(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});


app.options('*', cors());
// app.set('view engine', 'ejs')
// app.use(express.static('public'))
app.use(express.json());

app.get("/", (req, res) => {
	res.send({ link: uuidV4() });
});

// app.get("/:room", (req, res) => {
// 	res.render("room", { roomId: req.params.room });
// });

io.on("connection", (socket) => {
	socket.on("join-room", (userData) => {
		const { roomId, userId } = userData;
		console.log("Joining room : " + roomId + "\nUser : " + userId + "\n")
		socket.join(roomId);
		socket.to(roomId).emit("user-connected", userData);
		
		socket.on("disconnect", () => { 
			socket.to(roomId).emit("user-disconnected", userId);
		});

		socket.on('broadcast-message', (message) => {
            socket.to(roomId).emit('new-broadcast-messsage', {...message, userData});
        });
	});
});

const peerServer = PeerServer({ port: 9000, path: '/peer' });

server.listen(PORT);
