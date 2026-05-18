const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function listStagePostsBySlug(req, res, next) {
  try {
    const stage = await prisma.stage.findUnique({ where: { slug: req.params.slug } });
    if (!stage) return res.status(404).json({ message: 'Etapa no encontrada' });

    const posts = await prisma.stagePost.findMany({
      where: { stageId: stage.id, published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function listStagePostsByStageId(req, res, next) {
  try {
    const stageId = Number(req.query.stageId);
    if (!stageId) return res.status(400).json({ message: 'stageId requerido' });
    const posts = await prisma.stagePost.findMany({
      where: { stageId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function createStagePost(req, res, next) {
  try {
    const { title, content, stageId, published } = req.body;
    if (!title || !content || !stageId) {
      return res
        .status(400)
        .json({ message: 'title, content y stageId son requeridos' });
    }
    const data = {
      title,
      content,
      stageId: Number(stageId),
      published: published === undefined ? true : published === 'true' || published === true,
    };
    if (req.file) data.image = fileToPublicUrl(req.file);
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

    if (req.user?.role === 'COORDINATOR' && current.stageId !== req.user.stageId) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const { title, content, published, stageId } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(stageId !== undefined &&
        req.user?.role !== 'COORDINATOR' && { stageId: Number(stageId) }),
      ...(published !== undefined && {
        published: published === 'true' || published === true,
      }),
    };
    if (req.file) {
      data.image = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.image, uploadDir);
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
    if (req.user?.role === 'COORDINATOR' && current.stageId !== req.user.stageId) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }
    await prisma.stagePost.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.image, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStagePostsBySlug,
  listStagePostsByStageId,
  createStagePost,
  updateStagePost,
  deleteStagePost,
};
