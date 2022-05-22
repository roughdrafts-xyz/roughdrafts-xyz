const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')

const viewDashboard = async ctx => {
  const user = await prisma.user.findUnique({
    where: { displayId: ctx.params.displayId }
  })
  const newArticleId = await nanoid()

  return render('dashboard', {
    ...user,
    thoughts: [],
    newArticleId
  })
}

const addThought = async ctx => {
  return redirect(`/@${ctx.params.displayId}/thoughts`)
}

module.exports = {
  addThought,
  viewDashboard
}
