const Koa = require('koa');
const Router = require('koa-router');
const { getPathInfo, checkRoleMiddleware, createDir, uploadFile } = require('./filesystem');
const app = new Koa();
const router = new Router();
const { koaBody } = require('koa-body');

router.get(/\/admin.*/, checkRoleMiddleware, async(ctx) => {
  console.log('admin');
  await getPathInfo(ctx);
});

router.get(/.*/, async(ctx) => {
  await getPathInfo(ctx);
});

router.post(/.*/, checkRoleMiddleware, async(ctx) => {
  // for files multipart with `file` as name
  if (ctx.request.files?.file) {
    await uploadFile(ctx);
  } else {
    await createDir(ctx);
  }
});

app.use(koaBody({ multipart: true }));
app.use(router.routes());
app.listen(3000);
