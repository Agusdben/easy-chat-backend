import { Server } from 'socket.io'
import socketIOClient from 'socket.io-client'
import http from 'http'
import express from 'express'

describe('Testing creation of rooms', () => {
  let io, clientSocket, app, server

  beforeAll((done) => {
    app = express()
    server = http.createServer(app)
    io = new Server(server)

    server.listen(() => {
      const PORT = process.env.PORT || 3003
      clientSocket = socketIOClient(`http://localhost:${PORT}`)

      clientSocket.on('connect', done)
    })
  })

  afterAll(() => {
    io.close()
    clientSocket.close()
  })

  test('Should throw error when room name is too short', (done) => {
    const roomName = 'r'
    const creator = { id: '12345', username: 'john' }
    const expectedErrorMessage = 'Invalid room name'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })

  test('Should throw error when room name is too long', (done) => {
    const roomName = 'thisisaverylongroomnamethatislongerthan20characters'
    const creator = { id: '12345', username: 'john' }
    const expectedErrorMessage = 'Invalid room name'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })

  test('Should create a new room successfully', (done) => {
    const roomName = 'room1'
    const creator = { id: '12345', username: 'john' }

    clientSocket.on('server:send_rooms', (rooms) => {
      expect(rooms).toHaveLength(1)
      expect(rooms[0].roomName).toBe(roomName)
      expect(rooms[0].creator).toEqual(creator)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })

  test('Should throw error when room already exists', (done) => {
    const roomName = 'room1'
    const creator = { id: '12345', username: 'john' }
    const expectedErrorMessage = 'Room already exist'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })

  test('Should throw error when user already has a room', (done) => {
    const roomName = 'room2'
    const creator = { id: '12345', username: 'john' }
    const expectedErrorMessage = 'You already have a room'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })

  test('Should throw error when user is not authenticated', (done) => {
    const roomName = 'New room'
    const creator = { id: '', username: '' }
    const expectedErrorMessage = 'User is not authenticated'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:create_room', { roomName, creator })
  })
})
