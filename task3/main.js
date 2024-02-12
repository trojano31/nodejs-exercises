const Koa = require('koa');
const Router = require('koa-router');
const { getPathInfo, checkRoleMiddleware } = require('./filesystem');
const app = new Koa();
const router = new Router();

router.get(/\/admin.*/, checkRoleMiddleware, async(ctx) => {
  console.log('admin', )
  await getPathInfo(ctx)
});

router.get(/.*/, async(ctx) => {
  await getPathInfo(ctx)
});

router.post(/.*/, async(ctx) => {
  ctx.body = 'hey';
});


app.use(router.routes());
app.listen(3000);
