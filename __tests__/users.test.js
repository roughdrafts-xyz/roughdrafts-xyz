const request = require('supertest')
const serverPromise = require('../server')

let server
// const { login, loginCallback, logout } = require('./handlers')
describe('User Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays User Page', async () => {
    await request(server.app)
      .get('/@1234')
      .expect(200)
  })

  test('Displays User Settings Page', async () => {
    await request(server.app)
      .get('/settings')
      .expect(200)
  })

  test('Updates User Settings and Displays Updated User Settings Page', async () => {
    await request(server.app)
      .get('/settings')
      .expect(200)
  })
})
