import { MAX_ROOMS, ROOM_NAME_MAX_LENGTH, ROOM_NAME_MIN_LENGTH } from '../constants/room'
import Room from '../models/room.model'
import messagesController from './messages.controller'

class RoomsController {
  rooms = {}

  constructor () {
    setInterval(() => {
      this.checkEmptyRooms()
    }, 180000) // 3 min
  }

  checkEmptyRooms () {
    const emptyRooms = []
    for (const roomName in this.rooms) {
      const room = this.rooms[roomName]
      if (room.usersNumber === 0) {
        emptyRooms.push(roomName)
        this.removeRoom({ roomName: room.roomName })
        messagesController.removeMessagesOfRoom({ roomName: room.roomName })
      }
    }

    if (emptyRooms.length > 0) {
      console.log(`Empty rooms deleted: ${emptyRooms.join(', ')}`)
    }
  }

  addNewRoom ({ roomName, room }) {
    this.rooms[roomName] = room
  }

  createRoom ({ roomName, creator }) {
    if (this.rooms[roomName] !== undefined) {
      throw new Error('Room already exist')
    }

    if (Object.values(this.rooms).some(r => r.creator.id === creator.id)) {
      throw new Error('You already have a room')
    }

    if (roomName.trim().length < ROOM_NAME_MIN_LENGTH || roomName.trim().length > ROOM_NAME_MAX_LENGTH) {
      throw new Error('Invalid room name')
    }

    if (creator.id === '' || creator.username === '') {
      throw new Error('User is not authenticated')
    }

    if (Object.values(this.rooms).length === MAX_ROOMS) {
      throw new Error('Maximum number of rooms reached')
    }

    const newRoom = new Room({ roomName, creator, users: [], usersNumber: 0 })

    this.addNewRoom({ roomName, room: newRoom })
  }

  removeRoom ({ roomName }) {
    delete this.rooms[roomName]
    console.log({ roomName })
  }

  getRooms () {
    return Object.values(this.rooms)
  }

  getRoom ({ roomName }) {
    if (this.rooms[roomName] === undefined) {
      throw new Error('Room does not exists')
    }

    return this.rooms[roomName]
  }

  getRoomThatContainUser ({ userId }) {
    const rooms = this.getRooms()
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i]
      const { users } = room
      console.log({ users })
      const index = users.findIndex(user => user.id === userId)
      if (index !== -1) {
        return room.roomName
      }
    }
    return null
  }

  addUserToARoom ({ username, userId, roomName }) {
    const room = this.getRoom({ roomName })

    const { users } = room

    const newUsers = [...users, { username, id: userId }]

    const updatedRoom = {
      ...room,
      users: newUsers,
      usersNumber: room.usersNumber + 1
    }

    this.rooms[roomName] = updatedRoom
  }

  removeUserFromRoom ({ username, roomName }) {
    const room = this.getRoom({ roomName })

    const { users } = room

    const newUsers = users.filter(u => u.username !== username)

    const newRoom = {
      ...room,
      usersNumber: newUsers.length,
      users: newUsers
    }

    const updatedRoom = new Room({ ...newRoom })

    this.rooms[roomName] = updatedRoom
  }
}

const roomController = new RoomsController()

export default roomController
