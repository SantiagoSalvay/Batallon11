const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listStages(_req, res, next) {
  try {
    const stages = await prisma.stage.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json(stages);
  } catch (err) {
    next(err);
  }
}

async function getStageBySlug(req, res, next) {
  try {
    const stage = await prisma.stage.findUnique({
      where: { slug: req.params.slug },
      include: {
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!stage) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }
    res.json(stage);
  } catch (err) {
    next(err);
  }
}

async function createStage(req, res, next) {
  try {
    const { name, description, color, order } = req.body;
    let { slug } = req.body;
    if (!name) return res.status(400).json({ message: 'name es requerido' });
    slug = slug ? slugify(slug) : slugify(name);

    const data = {
      name,
      slug,
      description,
      color,
      order: order !== undefined ? Number(order) : 0,
    };

    if (req.files?.logo?.[0]) data.logo = fileToPublicUrl(req.files.logo[0]);
    if (req.files?.coverImage?.[0])
      data.coverImage = fileToPublicUrl(req.files.coverImage[0]);

    const stage = await prisma.stage.create({ data });
    res.status(201).json(stage);
  } catch (err) {
    next(err);
  }
}

async function updateStage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, description, color, order, active } = req.body;
    let { slug } = req.body;

    const current = await prisma.stage.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Etapa no encontrada' });

    const data = {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug: slugify(slug) }),
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
      ...(order !== undefined && { order: Number(order) }),
      ...(active !== undefined && { active: active === 'true' || active === true }),
    };

    if (req.files?.logo?.[0]) {
      data.logo = fileToPublicUrl(req.files.logo[0]);
      deleteOldFileFromUrl(fs, current.logo, uploadDir);
    }
    if (req.files?.coverImage?.[0]) {
      data.coverImage = fileToPublicUrl(req.files.coverImage[0]);
      deleteOldFileFromUrl(fs, current.coverImage, uploadDir);
    }

    const updated = await prisma.stage.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteStage(req, res, next) {
  try {
    const id = Number(req.params.id);
    const stage = await prisma.stage.findUnique({ where: { id } });
    if (!stage) return res.status(404).json({ message: 'Etapa no encontrada' });

    await prisma.stage.delete({ where: { id } });
    deleteOldFileFromUrl(fs, stage.logo, uploadDir);
    deleteOldFileFromUrl(fs, stage.coverImage, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStages,
  getStageBySlug,
  createStage,
  updateStage,
  deleteStage,
};
