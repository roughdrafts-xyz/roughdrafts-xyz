const { PrismaClient } = jest.createMockFromModule('@prisma/client')
const prisma = new PrismaClient({ log: ['query'] })
module.exports = prisma
