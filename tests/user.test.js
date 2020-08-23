const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const app = require('../src/app')
const User = require('../src/models/user')
const userId = new mongoose.Types.ObjectId()

const user = {
  _id: userId,
  email: 'marco@example.com',
  password: 'password!!',
  name: 'marcos',
  tokens: [
    { token: jwt.sign({ id: userId }, process.env.JWT_SECRET) }
  ]
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(user).save()
})

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Marco',
      email: 'marco@126.com',
      password: 'marcopassword'
    })
    .expect(200)
})

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: user.email,
      password: user.password
    })
    .expect(200)
})

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: user.email,
      password: 'adfasdfs'
    })
    .expect(500)
})

test('Should get profile for authenticated user', async () => {
  await request(app)
    .get('/users/me')
    .set('authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for authenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .set('authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})