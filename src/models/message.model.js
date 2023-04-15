export default class Message {
  constructor ({ author, message, roomName, date }) {
    this.author = author
    this.message = message
    this.roomName = roomName
    this.date = date
  }
}
