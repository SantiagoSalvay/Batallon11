const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { isValidStageSlug } = require('../lib/stages');

const incluirImagenes = {
  imagenes: { orderBy: [{ orden: 'asc' }, { creadaEn: 'asc' }] },
};

function esAdministrador(user) {
  return Boolean(user && ['ADMIN', 'EDITOR'].includes(user.role));
}

function puedeGestionar(user, publicacion) {
  if (esAdministrador(user)) return true;
  return Boolean(
    user?.role === 'COORDINATOR' &&
      user.stageSlug &&
      publicacion.etapaSlug === user.stageSlug,
  );
}

function resolverEtapaSolicitada(valor) {
  if (valor === undefined || valor === null || valor === '' || valor === 'general') {
    return null;
  }
  return String(valor);
}

function validarEtapa(etapaSlug) {
  if (etapaSlug !== null && !isValidStageSlug(etapaSlug)) {
    const error = new Error('Etapa no valida');
    error.status = 400;
    throw error;
  }
}

function datosImagenes(files = []) {
  return files.map((file, orden) => ({
    rutaOriginal: null,
    rutaOptimizada: fileToPublicUrl(file),
    nombreOriginal: file.originalname || null,
    tipoMimeOriginal: file.mimetype || null,
    tamanoOptimizado: file.size || null,
    orden,
  }));
}

function borrarArchivos(files = []) {
  for (const file of files) {
    deleteOldFileFromUrl(fs, fileToPublicUrl(file), uploadDir);
  }
}

function borrarRutasDeImagenes(imagenes = []) {
  const rutas = new Set();
  for (const imagen of imagenes) {
    if (imagen.rutaOriginal) rutas.add(imagen.rutaOriginal);
    if (imagen.rutaOptimizada) rutas.add(imagen.rutaOptimizada);
  }
  for (const ruta of rutas) deleteOldFileFromUrl(fs, ruta, uploadDir);
}

async function listarPublicaciones(req, res, next) {
  try {
    const etapaSlug = resolverEtapaSolicitada(req.query.etapa);
    validarEtapa(etapaSlug);

    const puedeVerBorradores =
      esAdministrador(req.user) ||
      (req.user?.role === 'COORDINATOR' && req.user.stageSlug === etapaSlug);

    const limite = Math.min(Number(req.query.limite) || 20, 100);
    const desplazamiento = Number(req.query.desplazamiento) || 0;
    const publicaciones = await prisma.publicacion.findMany({
      where: {
        etapaSlug,
        ...(puedeVerBorradores ? {} : { publicada: true }),
      },
      include: incluirImagenes,
      orderBy: { creadaEn: 'desc' },
      take: limite,
      skip: desplazamiento,
    });
    res.json(publicaciones);
  } catch (error) {
    next(error);
  }
}

async function listarPublicacionesDeEtapa(req, res, next) {
  req.query.etapa = req.params.slug;
  return listarPublicaciones(req, res, next);
}
async function obtenerPublicacion(req, res, next) {
  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: Number(req.params.id) },
      include: incluirImagenes,
    });
    if (!publicacion) return res.status(404).json({ message: 'Publicacion no encontrada' });
    if (!publicacion.publicada && !puedeGestionar(req.user, publicacion)) {
      return res.status(404).json({ message: 'Publicacion no encontrada' });
    }
    res.json(publicacion);
  } catch (error) {
    next(error);
  }
}

async function crearPublicacion(req, res, next) {
  const files = Array.isArray(req.files) ? req.files : [];
  try {
    const { titulo, contenido, publicada } = req.body;
    if (!titulo || !contenido) {
      borrarArchivos(files);
      return res.status(400).json({ message: 'titulo y contenido son requeridos' });
    }

    const etapaSlug =
      req.user?.role === 'COORDINATOR'
        ? req.user.stageSlug
        : resolverEtapaSolicitada(req.body.etapaSlug);
    validarEtapa(etapaSlug);

    const publicacion = await prisma.publicacion.create({
      data: {
        titulo,
        contenido,
        publicada: publicada === undefined ? true : publicada === 'true' || publicada === true,
        etapaSlug,
        imagenes: { create: datosImagenes(files) },
      },
      include: incluirImagenes,
    });
    res.status(201).json(publicacion);
  } catch (error) {
    borrarArchivos(files);
    next(error);
  }
}

async function actualizarPublicacion(req, res, next) {
  const files = Array.isArray(req.files) ? req.files : [];
  try {
    const id = Number(req.params.id);
    const actual = await prisma.publicacion.findUnique({
      where: { id },
      include: incluirImagenes,
    });
    if (!actual) {
      borrarArchivos(files);
      return res.status(404).json({ message: 'Publicacion no encontrada' });
    }
    if (!puedeGestionar(req.user, actual)) {
      borrarArchivos(files);
      return res.status(403).json({ message: 'No autorizado para esta publicacion' });
    }

    const { titulo, contenido, publicada } = req.body;
    let etapaSlug = actual.etapaSlug;
    if (req.user?.role === 'COORDINATOR') {
      etapaSlug = req.user.stageSlug;
    } else if (req.body.etapaSlug !== undefined) {
      etapaSlug = resolverEtapaSolicitada(req.body.etapaSlug);
      validarEtapa(etapaSlug);
    }

    const siguienteOrden = actual.imagenes.reduce(
      (maximo, imagen) => Math.max(maximo, imagen.orden),
      -1,
    ) + 1;
    const nuevasImagenes = datosImagenes(files).map((imagen, indice) => ({
      ...imagen,
      orden: siguienteOrden + indice,
    }));

    const publicacion = await prisma.publicacion.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(contenido !== undefined && { contenido }),
        ...(publicada !== undefined && {
          publicada: publicada === 'true' || publicada === true,
        }),
        etapaSlug,
        ...(nuevasImagenes.length && { imagenes: { create: nuevasImagenes } }),
      },
      include: incluirImagenes,
    });
    res.json(publicacion);
  } catch (error) {
    borrarArchivos(files);
    next(error);
  }
}

async function eliminarImagenPublicacion(req, res, next) {
  try {
    const publicacionId = Number(req.params.id);
    const imagen = await prisma.imagenPublicacion.findUnique({
      where: { id: req.params.imagenId },
      include: { publicacion: true },
    });
    if (!imagen || imagen.publicacionId !== publicacionId) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    if (!puedeGestionar(req.user, imagen.publicacion)) {
      return res.status(403).json({ message: 'No autorizado para esta publicacion' });
    }

    await prisma.imagenPublicacion.delete({ where: { id: imagen.id } });
    borrarRutasDeImagenes([imagen]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function eliminarPublicacion(req, res, next) {
  try {
    const id = Number(req.params.id);
    const actual = await prisma.publicacion.findUnique({
      where: { id },
      include: incluirImagenes,
    });
    if (!actual) return res.status(404).json({ message: 'Publicacion no encontrada' });
    if (!puedeGestionar(req.user, actual)) {
      return res.status(403).json({ message: 'No autorizado para esta publicacion' });
    }

    await prisma.publicacion.delete({ where: { id } });
    borrarRutasDeImagenes(actual.imagenes);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarPublicaciones,
  listarPublicacionesDeEtapa,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarImagenPublicacion,
  eliminarPublicacion,
};