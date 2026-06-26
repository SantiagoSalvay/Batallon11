const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToStorageReference, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { audit } = require('../utils/auditLog');
const {
  postInclude,
  toPostApi,
  toPostApiList,
  addPostImages,
  getPostImageUrls,
} = require('../utils/publicacionApi');

const sitePostWhere = { published: true, stageSlug: null };

function uploadedFiles(req) {
  if (req.file) return [req.file];
  if (!req.files) return [];
  return Object.values(req.files).flat();
}

async function listPosts(req, res, next) {
  try {
    const take = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Number(req.query.offset) || 0;
    const posts = await prisma.publicacion.findMany({
      where: sitePostWhere,
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json(toPostApiList(posts));
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await prisma.publicacion.findUnique({
      where: { id: Number(req.params.id) },
      include: postInclude,
    });
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });
    if (!post.published) {
      const can = req.user && ['ADMIN', 'EDITOR'].includes(req.user.role);
      if (!can) return res.status(404).json({ message: 'Post no encontrado' });
    }
    res.json(toPostApi(post));
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, content, published = true } = req.body;
    const post = await prisma.publicacion.create({
      data: { title, content, published, stageSlug: null },
      include: postInclude,
    });

    const files = uploadedFiles(req);
    await addPostImages(post.id, files.map(fileToStorageReference));

    const withImage = await prisma.publicacion.findUnique({
      where: { id: post.id },
      include: postInclude,
    });

    audit(req, 'post.create', { postId: post.id });
    res.status(201).json(toPostApi(withImage));
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.publicacion.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });

    const { title, content, published } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(published !== undefined && { published }),
    };

    await prisma.publicacion.update({ where: { id }, data });

    const files = uploadedFiles(req);
    await addPostImages(id, files.map(fileToStorageReference));

    const post = await prisma.publicacion.findUnique({
      where: { id },
      include: postInclude,
    });
    res.json(toPostApi(post));
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.publicacion.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });

    const imageUrls = await getPostImageUrls(id);
    await prisma.publicacion.delete({ where: { id } });
    imageUrls.forEach((imageUrl) => deleteOldFileFromUrl(fs, imageUrl, uploadDir));
    audit(req, 'post.delete', { postId: id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };
