import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../constants/user'
import User from '../models/user.model'

class UsersController {
  users = {}

  userExists ({ username }) {
    return Boolean(this.users[username])
  }

  addUser ({ username, user }) {
    if (!(user instanceof User)) {
      throw new Error('Parameter user is not instance of User class')
    }

    this.users[username] = user
  }

  getUserById ({ userId }) {
    const users = Object.values(this.users)
    const index = users.findIndex(user => user.id === userId)

    if (index === -1) {
      return null
    }
    return users[index]
  }

  removeUser ({ username }) {
    delete this.users[username]
  }

  authUser ({ username, id }) {
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
      throw new Error('Invalid username')
    }

    if (this.userExists({ username })) {
      throw new Error('Username already in use')
    }

    const user = new User({ username, id })

    this.addUser({ username, user })

    return user
  }
}

const userController = new UsersController()

export default userController
