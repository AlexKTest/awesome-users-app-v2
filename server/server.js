const express = require('express')
const cors = require('cors')
const { uuid } = require('uuidv4')

const app = express()
app.use(cors())
app.use(express.json())
const port = 3003

const getAccountsPage = (accounts, page, perPage) => {
  const start = (parseInt(page) - 1) * parseInt(perPage)
  const end = start + parseInt(perPage)
  return accounts.slice(start, end)
}

const getAccounts = (page, perPage) => {
  const accounts = JSON.parse(require('fs').readFileSync('./accounts.json', 'utf-8'))
  const pagedAccounts = page && perPage ? getAccountsPage(accounts, page, perPage) : accounts
  return pagedAccounts
}

const getUsers = (q) => {
  const users = JSON.parse(require('fs').readFileSync('./users.json', 'utf-8'))
  const filteredUsers = q ? users.filter(user => user.name.includes(q)) : users
  return filteredUsers
}

const addUser = user => {
  const users = getUsers()
  users.unshift(user)
  require('fs').writeFileSync('./users.json', JSON.stringify(users, null, 2), 'utf-8')
}

const updateUser = ({ id, name, age }) => {
  const users = getUsers().map(user => user.id === id ? { name, age, id } : user)
  require('fs').writeFileSync('./users.json', JSON.stringify(users, null, 2), 'utf-8')
}

const resJson = (res, json, time = 1000) => {
  setTimeout(() => res.json(json), Math.random() * time)
}

app.get('/accounts', (req, res) => {
  const { page, per_page } = req.query
  const accounts = getAccounts(page, per_page)
  return resJson(res, accounts, accounts.length)
})

app.get('/users', (req, res) => {
  const { q } = req.query
  const users = getUsers(q)
  return resJson(res, users)
})

app.put('/users', (req, res) => {
  const user = req.body
  updateUser(user)
  return resJson(res, getUsers())
})

app.post('/users', (req, res) => {
  const { name, age, id } = req.body
  if (!name) {
    res.status(400)
    return resJson(res, { error: 'User Name is required'})
  }
  if (age && typeof age !== 'number') {
    res.status(400)
    return resJson(res, { error: 'User Age should be a number'})
  }
  addUser({ id: id || uuid(), name, age: age || 18 })
  return resJson(res, getUsers())
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})