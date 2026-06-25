const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToStorageReference, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { isValidStageSlug } = require('../lib/stages');
const { audit } = require('../utils/auditLog');
const {
  postInclude,
  toPostApi,
  toPostApiList,
  setPostImage,
  getPostImageUrl,
} = require('../utils/publicacionApi');

// Copia la imagen de una publicación de etapa a la galería de esa etapa.
async function mirrorImageToStageGallery(file, caption, stageSlug) {
  if (!file?.galleryFile) return;
  await prisma.imagenGaleriaEtapa.create({
    data: {
      imageUrl: fileToStorageReference(file.galleryFile),
      caption: caption || null,
      order: 0,
      stageSlug,
    },
  });
}

async function listStagePostsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    if (!isValidStageSlug(slug)) {
      return res.status(404).json({ message: 'Etapa no encontrada' });
    }

    const posts = await prisma.publicacion.findMany({
      where: { stageSlug: slug, published: true },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(toPostApiList(posts));
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

    const posts = await prisma.publicacion.findMany({
      where: canManage ? { stageSlug } : { stageSlug, published: true },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(toPostApiList(posts));
  } catch (err) {
    next(err);
  }
}

async function createStagePost(req, res, next) {
  try {
    const { title, content, stageSlug, published = true } = req.body;
    if (!isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }

    const post = await prisma.publicacion.create({
      data: { title, content, stageSlug, published },
    });

    if (req.file) {
      await setPostImage(post.id, fileToStorageReference(req.file));
      await mirrorImageToStageGallery(req.file, title, stageSlug);
    }

    const withImage = await prisma.publicacion.findUnique({
      where: { id: post.id },
      include: postInclude,
    });

    audit(req, 'stage_post.create', { postId: post.id, stageSlug });
    res.status(201).json(toPostApi(withImage));
  } catch (err) {
    next(err);
  }
}

async function updateStagePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.publicacion.findUnique({ where: { id } });
    if (!current || !current.stageSlug) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const { title, content, published, stageSlug } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(stageSlug !== undefined &&
        req.user?.role !== 'COORDINATOR' && { stageSlug }),
      ...(published !== undefined && { published }),
    };
    if (stageSlug !== undefined && !isValidStageSlug(stageSlug)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }

    await prisma.publicacion.update({ where: { id }, data });

    if (req.file) {
      const imageUrl = fileToStorageReference(req.file);
      const previousUrl = await setPostImage(id, imageUrl);
      deleteOldFileFromUrl(fs, previousUrl, uploadDir);
      const effectiveStageSlug = data.stageSlug ?? current.stageSlug;
      await mirrorImageToStageGallery(req.file, title ?? current.title, effectiveStageSlug);
    }

    const post = await prisma.publicacion.findUnique({
      where: { id },
      include: postInclude,
    });
    res.json(toPostApi(post));
  } catch (err) {
    next(err);
  }
}

async function deleteStagePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.publicacion.findUnique({ where: { id } });
    if (!current || !current.stageSlug) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }
    if (req.user?.role === 'COORDINATOR' && current.stageSlug !== req.user.stageSlug) {
      return res.status(403).json({ message: 'No autorizado para esta etapa' });
    }

    const imageUrl = await getPostImageUrl(id);
    await prisma.publicacion.delete({ where: { id } });
    deleteOldFileFromUrl(fs, imageUrl, uploadDir);
    audit(req, 'stage_post.delete', { postId: id, stageSlug: current.stageSlug });
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
