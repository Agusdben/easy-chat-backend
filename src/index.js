import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server as WebSocketServer } from 'socket.io'
import userController from './controllers/users.controller'
import roomController from './controllers/rooms.controller'
import messagesController from './controllers/messages.controller'

const WHITE_LIST = ['http://localhost:3000', 'http://192.168.0.107:3000', 'http://192.168.0.210:3000']
const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())
app.use(cors({ origin: WHITE_LIST }))

const server = http.createServer(app)
const io = new WebSocketServer(server, {
  cors: {
    origin: WHITE_LIST,
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('client:auth', ({ username }) => {
    try {
      userController.authUser({ username, id: socket.id })
      socket.emit('server:user_authenticated', { username, id: socket.id })
      console.log(`User ${username} authenticated `)
    } catch (error) {
      socket.emit('server:error', error.message)
    }
  })

  socket.on('client:get_rooms', ({ username }) => {
    try {
      if (!userController.userExists({ username })) {
        throw new Error('User does not exists')
      }
      socket.emit('server:send_rooms', roomController.getRooms())
    } catch (error) {
      socket.emit('server:error', error.message)
    }
  })

  socket.on('client:create_room', (room) => {
    try {
      const { roomName, creator } = room
      roomController.createRoom({ roomName, creator })
      io.emit('server:send_rooms', roomController.getRooms())
    } catch (error) {
      console.log(error)
      socket.emit('server:error', error.message)
    }
  })

  socket.on('client:join_room', ({ roomName, username }) => {
    try {
      if (!userController.userExists({ username })) {
        throw new Error('Invalid username')
      }

      roomController.addUserToARoom({ username, userId: socket.id, roomName })
      socket.join(roomName)

      // send all messages to user joined
      const messages = messagesController.getMessagesOfARoom({ roomName })
      socket.emit('server:send_room_messages', messages)

      // send rooms updated to all users connected
      io.emit('server:send_rooms', roomController.getRooms())

      // send updated room info to users in room
      io.in(roomName).emit('server:user_join', roomController.getRoom({ roomName }))

      console.log(`User ${socket.id} join room: ${roomName}`)
    } catch (error) {
      console.log(error)
      socket.emit('server:error', error.message)
    }
  })

  socket.on('client:left_room', ({ username, roomName }) => {
    try {
      roomController.removeUserFromRoom({ username, roomName })
      io.emit('server:send_rooms', roomController.getRooms())
      io.in(roomName).emit('server:user_join', roomController.getRoom({ roomName }))
    } catch (error) {
      socket.emit('server:error', error.message)
    }
  })

  socket.on('client:send_message', (data) => {
    try {
      messagesController.handleSpamMessages({ userId: socket.id })
      messagesController.addMessageToARoom({ message: data })
      io.in(data.roomName).emit('server:receive_message', data)
    } catch (error) {
      console.log(error)
      if (error.message.includes('Spam')) {
        socket.emit('server:error', error.message)
      }
    }
  })

  socket.on('disconnect', () => {
    try {
      const user = userController.getUserById({ userId: socket.id })
      if (user) {
        const roomName = roomController.getRoomThatContainUser({ userId: socket.id })
        console.log({ user, roomName })
        if (roomName !== null) {
          roomController.removeUserFromRoom({ username: user.username, roomName })
          console.log(`User: ${user.username} removed from room: ${roomName}`)
        }
        userController.removeUser({ username: user.username })
        console.log(`User ${user.username} Disconnected`)
      }
    } catch (error) {
      console.log(error)
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`)
})
