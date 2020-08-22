const request = require('supertest')
const app = require('../src/app')

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