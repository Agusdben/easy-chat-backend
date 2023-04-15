import { LIMIT_SPAM_MESSAGES, MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH } from '../constants/message'
import Message from '../models/message.model'

class MessagesController {
  messages = {}
  usersLastMessagesCount = {}

  removeMessagesOfRoom ({ roomName }) {
    delete this.messages[roomName]
  }

  handleSpamMessages ({ userId }) {
    const userLastMessages = this.usersLastMessagesCount[userId]

    if (userLastMessages === LIMIT_SPAM_MESSAGES) {
      throw new Error('Spam detected, relax 🙏')
    }

    userLastMessages
      ? this.usersLastMessagesCount[userId] = userLastMessages + 1
      : this.usersLastMessagesCount[userId] = 1

    setTimeout(() => {
      this.usersLastMessagesCount[userId] = this.usersLastMessagesCount[userId] - 1
      if (this.usersLastMessagesCount[userId] === 0) {
        delete this.usersLastMessagesCount[userId]
      }
    }, 8000)
  }

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
