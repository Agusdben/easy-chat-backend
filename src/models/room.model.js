export default class Room {
  constructor ({ roomName, creator, usersNumber, users }) {
    this.roomName = roomName
    this.usersNumber = usersNumber
    this.users = users
    this.creator = creator
  }
}
