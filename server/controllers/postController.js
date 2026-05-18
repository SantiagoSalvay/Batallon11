const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function listPosts(req, res, next) {
  try {
    const take = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Number(req.query.offset) || 0;
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });
    if (!post.published) {
      const can = req.user && ['ADMIN', 'EDITOR'].includes(req.user.role);
      if (!can) return res.status(404).json({ message: 'Post no encontrado' });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, content, published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'title y content son requeridos' });
    }
    const data = {
      title,
      content,
      published: published === undefined ? true : published === 'true' || published === true,
    };
    if (req.file) data.image = fileToPublicUrl(req.file);

    const post = await prisma.post.create({ data });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.post.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });

    const { title, content, published } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(published !== undefined && {
        published: published === 'true' || published === true,
      }),
    };
    if (req.file) {
      data.image = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.image, uploadDir);
    }
    const post = await prisma.post.update({ where: { id }, data });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.post.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });
    await prisma.post.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.image, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };
