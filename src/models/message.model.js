export default class Message {
  constructor ({ author, message, roomName, date }) {
    this.author = author
    this.message = message
    this.roomName = roomName
    this.date = date
  }

  getAuthor () {
    return this.author
  }

  getMessage () {
    return this.message
  }

  getRoom () {
    return this.room
  }

  getTime () {
    return this.time
  }
}
