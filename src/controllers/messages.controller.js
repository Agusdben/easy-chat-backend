import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH } from '../constants/message'
import Message from '../models/message.model'

class MessagesController {
  messages = {}

  addMessageToARoom ({ message }) {
    if (message.message.trim().length > MAX_MESSAGE_LENGTH || message.message.trim().length < MIN_MESSAGE_LENGTH) {
      throw new Error('Invalid message')
    }

    const newMessage = new Message({ ...message })

    const roomMessages = this.messages[message.roomName]

    roomMessages
      ? this.messages[message.roomName] = [...roomMessages, newMessage]
      : this.messages[message.roomName] = [newMessage]
  }

  getMessagesOfARoom ({ roomName }) {
    const roomMessages = this.messages[roomName]

    if (!roomMessages) {
      return []
    }

    return roomMessages
  }
}

const messagesController = new MessagesController()

export default messagesController
