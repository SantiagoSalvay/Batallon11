const fs = require('fs');
const prisma = require('../config/prisma');
const { deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { isValidStageSlug } = require('../lib/stages');
const {
  eliminarObjetos,
  nuevoIdImagen,
  prepararYSubirImagen,
  urlDescarga,
  urlPublica,
} = require('../services/almacenamientoS3');

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

function presentarImagen(imagen) {
  return {
    ...imagen,
    rutaOriginal: urlPublica(imagen.rutaOriginal),
    rutaOptimizada: urlPublica(imagen.rutaOptimizada),
    descargaUrl: urlDescarga(
      imagen.rutaOriginal || imagen.rutaOptimizada,
      imagen.nombreOriginal || 'imagen.webp',
    ),
  };
}

function presentarPublicacion(publicacion) {
  return {
    ...publicacion,
    imagenes: (publicacion.imagenes || []).map(presentarImagen),
  };
}

function rutasS3(imagenes = []) {
  return imagenes.flatMap((imagen) => [imagen.rutaOriginal, imagen.rutaOptimizada]);
}

function borrarArchivosLocales(imagenes = []) {
  const rutas = new Set();
  for (const imagen of imagenes) {
    if (imagen.rutaOriginal?.startsWith('/uploads/')) rutas.add(imagen.rutaOriginal);
    if (imagen.rutaOptimizada?.startsWith('/uploads/')) rutas.add(imagen.rutaOptimizada);
  }
  for (const ruta of rutas) deleteOldFileFromUrl(fs, ruta, uploadDir);
}

async function eliminarAlmacenamiento(imagenes = []) {
  await eliminarObjetos(rutasS3(imagenes));
  borrarArchivosLocales(imagenes);
}

async function subirImagenes({ archivos, publicacionId, ordenInicial = 0 }) {
  const subidas = [];
  try {
    for (let indice = 0; indice < archivos.length; indice += 1) {
      const datos = await prepararYSubirImagen({
        archivo: archivos[indice],
        publicacionId,
        imagenId: nuevoIdImagen(),
      });
      subidas.push({ ...datos, orden: ordenInicial + indice });
    }
    return subidas;
  } catch (error) {
    await eliminarObjetos(rutasS3(subidas)).catch(() => {});
    throw error;
  }
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
    res.json(publicaciones.map(presentarPublicacion));
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
    res.json(presentarPublicacion(publicacion));
  } catch (error) {
    next(error);
  }
}

async function crearPublicacion(req, res, next) {
  const archivos = Array.isArray(req.files) ? req.files : [];
  let creada;
  let imagenesSubidas = [];
  try {
    const { titulo, contenido, publicada } = req.body;
    if (!titulo || !contenido) {
      return res.status(400).json({ message: 'titulo y contenido son requeridos' });
    }

    const etapaSlug =
      req.user?.role === 'COORDINATOR'
        ? req.user.stageSlug
        : resolverEtapaSolicitada(req.body.etapaSlug);
    validarEtapa(etapaSlug);

    creada = await prisma.publicacion.create({
      data: {
        titulo,
        contenido,
        publicada: publicada === undefined ? true : publicada === 'true' || publicada === true,
        etapaSlug,
      },
    });

    imagenesSubidas = await subirImagenes({ archivos, publicacionId: creada.id });
    if (imagenesSubidas.length) {
      await prisma.imagenPublicacion.createMany({
        data: imagenesSubidas.map((imagen) => ({ ...imagen, publicacionId: creada.id })),
      });
    }

    const publicacion = await prisma.publicacion.findUnique({
      where: { id: creada.id },
      include: incluirImagenes,
    });
    res.status(201).json(presentarPublicacion(publicacion));
  } catch (error) {
    await eliminarObjetos(rutasS3(imagenesSubidas)).catch(() => {});
    if (creada) await prisma.publicacion.delete({ where: { id: creada.id } }).catch(() => {});
    next(error);
  }
}

async function actualizarPublicacion(req, res, next) {
  const archivos = Array.isArray(req.files) ? req.files : [];
  let imagenesSubidas = [];
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

    const { titulo, contenido, publicada } = req.body;
    let etapaSlug = actual.etapaSlug;
    if (req.user?.role === 'COORDINATOR') {
      etapaSlug = req.user.stageSlug;
    } else if (req.body.etapaSlug !== undefined) {
      etapaSlug = resolverEtapaSolicitada(req.body.etapaSlug);
      validarEtapa(etapaSlug);
    }

    const ordenInicial = actual.imagenes.reduce(
      (maximo, imagen) => Math.max(maximo, imagen.orden),
      -1,
    ) + 1;
    imagenesSubidas = await subirImagenes({ archivos, publicacionId: id, ordenInicial });

    const publicacion = await prisma.publicacion.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(contenido !== undefined && { contenido }),
        ...(publicada !== undefined && {
          publicada: publicada === 'true' || publicada === true,
        }),
        etapaSlug,
        ...(imagenesSubidas.length && {
          imagenes: {
            create: imagenesSubidas.map((imagen) => ({
              id: imagen.id,
              rutaOriginal: imagen.rutaOriginal,
              rutaOptimizada: imagen.rutaOptimizada,
              nombreOriginal: imagen.nombreOriginal,
              tipoMimeOriginal: imagen.tipoMimeOriginal,
              tamanoOriginal: imagen.tamanoOriginal,
              tamanoOptimizado: imagen.tamanoOptimizado,
              ancho: imagen.ancho,
              alto: imagen.alto,
              orden: imagen.orden,
            })),
          },
        }),
      },
      include: incluirImagenes,
    });
    res.json(presentarPublicacion(publicacion));
  } catch (error) {
    await eliminarObjetos(rutasS3(imagenesSubidas)).catch(() => {});
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

    await eliminarAlmacenamiento([imagen]);
    await prisma.imagenPublicacion.delete({ where: { id: imagen.id } });
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

    await eliminarAlmacenamiento(actual.imagenes);
    await prisma.publicacion.delete({ where: { id } });
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