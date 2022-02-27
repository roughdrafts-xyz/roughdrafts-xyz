const request = require('supertest')
const serverPromise = require('../server')
const prisma = require('../prisma')

let server

const testArticle = {
  id: 1,
  authorId: 1,
  title: '🍎 Apple',
  summary: 'Delicious red thing',
  content: 'Apples are red',
  rawContent: 'Apples are red',
  tags: '#red #apple #fruit'
}

describe('Article Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays Article Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await request(server.app)
      .get('/1234')
      .expect(200)
  })

  test('Displays Article Raw Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await request(server.app)
      .get('/1234/raw')
      .expect(200)
  })

  test('Does Not Displays Article Settings Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await request(server.app)
      .get('/1234/settings')
      .expect(500)
  })

  test('Does Not Updates Article and Displays Updated Article Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await request(server.app)
      .get('/1234/edit')
      .expect(500)
  })

  test('Does Not Updates Article Settings and Displays Updated Article Settings Page', async () => {
    prisma.article.findUnique = jest.fn(() => testArticle)
    await request(server.app)
      .get('/1234/settings')
      .expect(500)
  })
})
