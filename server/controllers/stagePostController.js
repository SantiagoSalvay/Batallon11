const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { isValidStageSlug } = require('../lib/stages');

async function listStagePostsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    if (!isValidStageSlug(slug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const posts = await prisma.stagePost.findMany({
      where: { stageSlug: slug, published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function listStagePostsByStageSlug(req, res, next) {
  try {
    const stageSlug = req.query.stageSlug;
    if (!stageSlug) return res.status(400).json({ message: 'stageSlug requerido' });
    if (!isValidStageSlug(stageSlug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const canManage =
      req.user &&
      (['ADMIN', 'EDITOR'].includes(req.user.role) ||
        (req.user.role === 'COORDINATOR' && req.user.stageSlug === stageSlug));

    const posts = await prisma.stagePost.findMany({
      where: canManage ? { stageSlug } : { stageSlug, published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function createStagePost(req, res, next) {
  try {
    const { title, content, stageSlug, published } = req.body;
    if (!title || !content || !stageSlug) {
      return res
        .status(400)
        .json({ message: 'title, content y stageSlug son requeridos' });
    }
    if (!isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }

    const data = {
      title,
      content,
      stageSlug,
      published: published === undefined ? true : published === 'true' || published === true,
    };
    if (req.file) data.imageUrl = fileToPublicUrl(req.file);
    const post = await prisma.stagePost.create({ data });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function updateStagePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.stagePost.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });

    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const { title, content, published, stageSlug } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(stageSlug !== undefined &&
        req.user?.role !== 'COORDINATOR' && { stageSlug }),
      ...(published !== undefined && {
        published: published === 'true' || published === true,
      }),
    };
    if (stageSlug !== undefined && !isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }
    if (req.file) {
      data.imageUrl = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const post = await prisma.stagePost.update({ where: { id }, data });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function deleteStagePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.stagePost.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Post no encontrado' });
    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
    await prisma.stagePost.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStagePostsBySlug,
  listStagePostsByStageSlug,
  createStagePost,
  updateStagePost,
  deleteStagePost,
};
