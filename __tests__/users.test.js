const request = require('supertest')
const serverPromise = require('../server')
const prisma = require('../prisma')
const session = require('supertest-session')

let server
let authSession = null

const testUser = {
  id: 1,
  displayId: '1234',
  profile: {
    name: 'Test User',
    summary:
      'Two thousand or so words to test out the summary of this fake user.'
  },
  articles: [
    {
      title: '🍎 Apple',
      summary: 'Delicious red thing',
      tags: '#red #apple #fruit'
    }
  ]
}
// const { login, loginCallback, logout } = require('./handlers')
describe('User Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays User Page', async () => {
    prisma.user.findUnique = jest.fn(() => testUser)
    await request(server.app)
      .get('/@1234')
      .expect(200)
  })
  describe('Authenticated User Handlers', () => {
    beforeAll(async () => {
      authSession = session(server.app)
      await authSession.get('/login/callback').expect(303)
    })

    test('Displays User Settings Page', async () => {
      prisma.user.findUnique = jest.fn(() => testUser)
      await authSession.get('/settings').expect(200)
    })

    test('Updates User Settings and Displays Updated User Settings Page', async () => {
      prisma.user.findUnique = jest.fn(() => testUser)
      await authSession.get('/settings').expect(200)
    })
  })
})
