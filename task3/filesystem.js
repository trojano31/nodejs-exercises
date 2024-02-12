const path = require('node:path');
const fs = require('node:fs/promises');

const filesystemPath = path.resolve(__dirname, 'filesystem');
const ADMIN_ROLE = 'admin';

const getPathInfo = async(ctx) => {
  const reqPath = ctx.path || '/';
  const absPath = path.join(filesystemPath, reqPath);
  const stat = await fs.stat(absPath);
  if (!stat) {
    ctx.status = 404;
    return;
  }
  const isFile = stat.isFile();
  if (isFile) {
    await readFile(absPath, ctx);
  } else {
    await readDir(absPath, ctx);
  }
};

async function readFile(absPath, ctx) {
  const data = await fs.readFile(absPath, 'utf8');
  if (data) {
    ctx.body = {
      status: 200,
      content: data, path: ctx.path
    };
  }
}

async function readDir(absPath, ctx) {
  const data = await fs.readdir(absPath);
  ctx.body = {
    status: 200,
    nodes: data
  };
}

async function checkRoleMiddleware(ctx, next) {
  const role = ctx.request.headers.role;

  if (role !== ADMIN_ROLE) {
    ctx.throw(403, 'Access denied');
  }

  await next();
};

module.exports = {
  getPathInfo,
  checkRoleMiddleware
};
