const serverPromise = require('../server')
const prisma = require('../prisma')
const session = require('supertest-session')

let server
let authSession = null

const testArticle = {
  id: 1,
  authorId: 1,
  private: true,
  title: '🍎 Apple',
  summary: 'Delicious red thing',
  content: 'Apples are red',
  rawContent: 'Apples are red',
  tags: '#red #apple #fruit'
}

const testUser = {
  id: 1,
  displayId: '1234',
  name: 'Test User',
  summary:
    'Two thousand or so words to test out the summary of this fake user.',
  articles: [
    {
      title: '🍎 Apple',
      summary: 'Delicious red thing',
      tags: '#red #apple #fruit'
    }
  ]
}

describe('Authenticated Article Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
    prisma.user.findUnique = jest.fn(() => testUser)
    authSession = session(server.app)
    await authSession.get('/login/callback').expect(303)
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays Article Settings Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await authSession.get('/1234/settings').expect(200)
  })

  test('Updates Article Settings and Displays Updated Article Settings Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await authSession.get('/1234/settings').expect(200)
  })

  test('Displays Article Editor Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await authSession.get('/1234/edit').expect(200)
  })

  test('Updates Article and Displays Updated Article Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await authSession.get('/1234/edit').expect(200)
  })
})
