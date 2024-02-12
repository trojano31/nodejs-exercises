const path = require('node:path');
const fs = require('node:fs/promises');
const streamifier = require('streamifier');

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
    const isVideo = await isVideoFile(absPath);
      if (isVideo) {
      const videoBuffer = await fs.readFile(absPath);
      const videoStream = streamifier.createReadStream(videoBuffer);
      ctx.body = videoStream;
      ctx.set('Content-Type', 'video/mp4');
      ctx.set('Content-Disposition', `inline; filename="${path.basename(absPath)}"`);
    } else {
      await readFile(absPath, ctx);
    }
  } else {
    await readDir(absPath, ctx);
  }
}

async function isVideoFile(filePath) {
  let extension = path.extname(filePath).toLowerCase();
  const videoExtensions = ['.mp4', '.avi', '.mov'];
  return videoExtensions.includes(extension)
}


async function createDir(ctx, noRes = false) {
  const splitted = (ctx.path || '').split('/');
  const normalizedPath = splitted.map(p => p.trim().replaceAll(' ', '_')).join('/');
  const fullPath = getRequestPath({ path: normalizedPath });
  try {
    await fs.access(fullPath);
    if (!noRes) {
      ctx.status = 400;
      ctx.body = 'Path already exists';
    }
  } catch (error) {
    await fs.mkdir(fullPath, { recursive: true });
    if (!noRes) {
      ctx.status = 200;
      ctx.body = 'Directory created';
    }
  }
}

async function uploadFile(ctx) {
  const file = ctx.request.files.file;
  await createDir(ctx); // creates dir if not exists
  const destinationPath = path.join(filesystemPath, ctx.path, file.originalFilename)
  try {
    await fs.rename(file.filepath, destinationPath);
    ctx.status = 200;
    ctx.body = 'File uploaded';
  } catch (err){
    console.log(err)
    await fs.unlink(file.filePath)
    ctx.status = 400;
    ctx.body = 'Something went wrong'
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
  checkRoleMiddleware,
  uploadFile
};
