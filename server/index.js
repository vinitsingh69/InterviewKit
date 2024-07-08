const express = require("express")
const app = express()
const dotenv = require("dotenv")
const http = require("http")
const cors = require("cors")
const ACTIONS = require("./utils/actions")
const path = require("path")
app.use(cors())

dotenv.config()
app.use(express.json())

const { Server } = require("socket.io")
app.use(express.static(path.join(__dirname, "public")))


const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	},
})

let userSocketMap = []

function getUsersInRoom(roomId) {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

function getRoomId(socketId) {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	return user?.roomId
}

io.on("connection", (socket) => {
	// Handle user actions
	socket.on(ACTIONS.JOIN_REQUEST, ({ roomId, username }) => {
		// Check is username exist in the room
		const isUsernameExist = getUsersInRoom(roomId).filter(
			(u) => u.username === username
		)
		if (isUsernameExist.length > 0) {
			io.to(socket.id).emit(ACTIONS.USERNAME_EXISTS)
			return
		}

		const user = {
			username,
			roomId,
			status: ACTIONS.USER_ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(roomId)
		socket.broadcast.to(roomId).emit(ACTIONS.USER_JOINED, { user })
		const users = getUsersInRoom(roomId)
		io.to(socket.id).emit(ACTIONS.JOIN_ACCEPTED, { user, users })
	})

	socket.on("disconnecting", () => {
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		const roomId = user?.roomId
		if (roomId === undefined || user === undefined) return
		socket.broadcast.to(roomId).emit(ACTIONS.USER_DISCONNECTED, { user })
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)
		socket.leave()
	})

	// Handle file actions
	socket.on(ACTIONS.SYNC_FILES, ({ files, currentFile, socketId }) => {
		io.to(socketId).emit(ACTIONS.SYNC_FILES, {
			files,
			currentFile,
		})
	})

	socket.on(ACTIONS.FILE_CREATED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_CREATED, { file })
	})

	socket.on(ACTIONS.FILE_UPDATED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_UPDATED, { file })
	})

	socket.on(ACTIONS.FILE_RENAMED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_RENAMED, { file })
	})

	socket.on(ACTIONS.FILE_DELETED, ({ id }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_DELETED, { id })
	})

	// Handle user status
	socket.on(ACTIONS.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: ACTIONS.USER_OFFLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		socket.broadcast.to(roomId).emit(ACTIONS.USER_OFFLINE, { socketId })
	})

	socket.on(ACTIONS.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: ACTIONS.USER_ONLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		socket.broadcast.to(roomId).emit(ACTIONS.USER_ONLINE, { socketId })
	})

	// Handle chat actions
	socket.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.RECEIVE_MESSAGE, { message })
	})

	// Handle cursor position
	socket.on(ACTIONS.TYPING_START, ({ cursorPosition }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: true, cursorPosition }
			}
			return user
		})
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(ACTIONS.TYPING_START, { user })
	})

	socket.on(ACTIONS.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(ACTIONS.TYPING_PAUSE, { user })
	})

	socket.on(ACTIONS.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		socket.broadcast
			.to(roomId)
			.emit(ACTIONS.REQUEST_DRAWING, { socketId: socket.id })
	})

	socket.on(ACTIONS.SYNC_DRAWING, ({ drawingData, socketId }) => {
		socket.broadcast
			.to(socketId)
			.emit(ACTIONS.SYNC_DRAWING, { drawingData })
	})

	socket.on(ACTIONS.DRAWING_UPDATE, ({ snapshot }) => {
		const roomId = getRoomId(socket.id)
		socket.broadcast.to(roomId).emit(ACTIONS.DRAWING_UPDATE, {
			snapshot,
		})
	})
})

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
	// Send the index.html file
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Max-Age", "1800");
	res.setHeader("Access-Control-Allow-Headers", "content-type");
	res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})