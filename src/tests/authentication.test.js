import http from 'http'
import { Server } from 'socket.io'
import socketIOClient from 'socket.io-client'
import express from 'express'

describe('Testing user authentication', () => {
  let io, serverSocket, clientSocket
  let app, server

  beforeAll((done) => {
    app = express()
    server = http.createServer(app)
    io = new Server(server)

    server.listen(() => {
      const PORT = process.env.PORT || 3003
      clientSocket = socketIOClient(`http://localhost:${PORT}`)
      io.on('connection', (socket) => {
        serverSocket = socket
      })

      clientSocket.on('connect', done)
    })
  })

  test('Should authenticate user with valid username', (done) => {
    const username = 'john'
    const id = clientSocket.id
    const expectedResponse = { username, id }

    clientSocket.once('server:user_authenticated', (response) => {
      expect(response).toEqual(expectedResponse)
      done()
    })

    clientSocket.emit('client:auth', { username })
  })

  test('Should throw error with invalid username', (done) => {
    const username = 'a'
    const expectedErrorMessage = 'Invalid username'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:auth', { username })
  })

  test('Should throw error with username already in use', (done) => {
    const username = 'john'
    const expectedErrorMessage = 'Username already in use'

    clientSocket.once('server:error', (error) => {
      expect(error).toBe(expectedErrorMessage)
      done()
    })

    clientSocket.emit('client:auth', { username })
  })

  afterAll(() => {
    io.close()
    clientSocket.close()
    server.close()
  })
})
