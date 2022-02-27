const request = require('supertest')
const serverPromise = require('../server')
const prisma = require('../prisma')

let server
// const { login, loginCallback, logout } = require('./handlers')
describe('Article Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays Article Page', async () => {
    await request(server.app)
      .get('/1234')
      .expect(200)
  })

  test('Displays Article Editor Page', async () => {
    await request(server.app)
      .get('/settings/edit')
      .expect(200)
  })

  test('Displays Article Raw Page', async () => {
    await request(server.app)
      .get('/settings/raw')
      .expect(200)
  })

  test('Updates Article and Displays Updated Article Page', async () => {
    await request(server.app)
      .get('/1234/edit')
      .expect(200)
  })

  test('Displays Article Settings Page', async () => {
    await request(server.app)
      .get('/1234/settings')
      .expect(200)
  })

  test('Updates Article Settings and Displays Updated Article Settings Page', async () => {
    await request(server.app)
      .get('/1234/settings')
      .expect(200)
  })
})
