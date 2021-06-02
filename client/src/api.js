import { v4 } from 'uuid'
import _ from 'lodash'

let users = []

const addUser = (name, age) => {
  const user = { name, age: Number(age), id: v4() }
  console.log('user', user)
  fetch('http://localhost:3003/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  users.unshift(user)
  return Promise.resolve(users)
}

const updateUserApi = (user) => {
  fetch('http://localhost:3003/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
}

const updateUserApiDebounced = _.debounce(updateUserApi, 500)

const changeUserAge = (id, name, age) => {
  const updatedUser = { id, name, age }
  users = users.map((user) => (user.id === id ? updatedUser : user))
  updateUserApiDebounced(updatedUser)
  return Promise.resolve(users)
}

const getUsers = async () => {
  const res1 = await fetch('http://localhost:3003/users')
  const apiUsers = await res1.json()
  users = apiUsers
  return users
}

const getApiUsers = () => {
  return users
}

const getAccounts = async (page, perPage) => {
  const res = await fetch(`http://localhost:3003/accounts?page=${page}&per_page=${perPage}`)
  return await res.json()
}

const filterUsers = async (q) => {
  const res1 = await fetch(`http://localhost:3003/users?q=${q}`)
  const apiUsers = await res1.json()
  users = apiUsers
  return users
}

export default {
  addUser,
  changeUserAge,
  getUsers,
  getApiUsers,
  filterUsers,
  getAccounts,
}
