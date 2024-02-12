const path = require('node:path');
const fs = require('node:fs/promises');

const filesystemPath = path.resolve(__dirname, 'filesystem');
const ADMIN_ROLE = 'admin';

async function getPathInfo(ctx) {
  const absPath = getRequestPath(ctx);
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

async function createDir(ctx) {
  const absPath = getRequestPath(ctx);
  const stat = await fs.stat(absPath);
  const isDir = stat.isDirectory();
  if (!isDir) {
    ctx.status = 400;
    ctx.body = 'Path must be directory';
    return;
  }
  const normalizedPath = (ctx.request.body?.path || '').split('/').map(p => p.trim().replaceAll(' ', '_')).join('/');
  const fullPath = path.join(absPath, normalizedPath);
  try {
    await fs.access(fullPath);
    ctx.status = 400;
    ctx.body = 'Path already exists';
  } catch (error) {
    await fs.mkdir(fullPath, { recursive: true });
    ctx.status = 200;
    ctx.body = 'Directory created';
  }
}

function getRequestPath(ctx) {
  const reqPath = ctx.path || '/';
  return path.join(filesystemPath, reqPath);
}

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
  createDir,
  checkRoleMiddleware
};
