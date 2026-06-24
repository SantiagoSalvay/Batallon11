const crypto = require('crypto');
const path = require('path');
const sharp = require('sharp');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');

let detectarTipoDesdeBuffer;
async function detectarTipo(buffer) {
  if (!detectarTipoDesdeBuffer) {
    detectarTipoDesdeBuffer = import('file-type').then((modulo) => modulo.fileTypeFromBuffer);
  }
  return (await detectarTipoDesdeBuffer)(buffer);
}

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function variableRequerida(nombre) {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

function configuracion() {
  return {
    endpoint: variableRequerida('SUPABASE_S3_ENDPOINT'),
    region: variableRequerida('SUPABASE_S3_REGION'),
    accessKeyId: variableRequerida('SUPABASE_S3_ACCESS_KEY_ID'),
    secretAccessKey: variableRequerida('SUPABASE_S3_SECRET_ACCESS_KEY'),
    bucket: variableRequerida('SUPABASE_STORAGE_BUCKET'),
    prefijo: (process.env.SUPABASE_STORAGE_PREFIX || 'Publicaciones').trim().replace(/^\/+|\/+$/g, ''),
    projectUrl: variableRequerida('SUPABASE_PROJECT_URL').replace(/\/$/, ''),
  };
}

let cliente;
function clienteS3() {
  if (!cliente) {
    const config = configuracion();
    cliente = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return cliente;
}

function nombreSeguro(nombre) {
  const base = path.basename(nombre || 'imagen')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return base || 'imagen';
}

function nombreDescarga(nombreOriginal, extension) {
  const base = nombreSeguro(nombreOriginal).replace(/\.[^.]+$/, '');
  return `${base}.${extension}`;
}

function codificarRuta(ruta) {
  return ruta.split('/').map(encodeURIComponent).join('/');
}

function urlPublica(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta) || ruta.startsWith('/uploads/')) return ruta;
  const config = configuracion();
  return `${config.projectUrl}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${codificarRuta(ruta)}`;
}

function urlDescarga(ruta, nombre) {
  const publica = urlPublica(ruta);
  if (!publica || publica.startsWith('/uploads/')) return publica;
  const separador = publica.includes('?') ? '&' : '?';
  return `${publica}${separador}download=${encodeURIComponent(nombre || 'imagen')}`;
}

async function validarBucket() {
  const config = configuracion();
  await clienteS3().send(new HeadBucketCommand({ Bucket: config.bucket }));
}

async function subirObjeto({ clave, buffer, tipoMime, disposicion, cacheControl }) {
  const config = configuracion();
  await clienteS3().send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: clave,
    Body: buffer,
    ContentType: tipoMime,
    ContentDisposition: disposicion,
    CacheControl: cacheControl,
  }));
}

async function eliminarObjetos(rutas) {
  const claves = [...new Set((rutas || []).filter((ruta) => ruta && !ruta.startsWith('/uploads/') && !/^https?:\/\//i.test(ruta)))];
  if (!claves.length) return;
  const config = configuracion();
  await clienteS3().send(new DeleteObjectsCommand({
    Bucket: config.bucket,
    Delete: { Objects: claves.map((Key) => ({ Key })), Quiet: true },
  }));
}

async function prepararYSubirImagen({ archivo, publicacionId, imagenId }) {
  if (!archivo?.buffer) throw new Error('Archivo de imagen invalido');

  const tipo = await detectarTipo(archivo.buffer);
  if (!tipo || !TIPOS_PERMITIDOS.has(tipo.mime)) {
    const error = new Error('Tipo de imagen no permitido o archivo no reconocido');
    error.status = 400;
    throw error;
  }

  const maximoPixeles = Number(process.env.MAX_IMAGE_PIXELS || 25000000);
  const bordeMaximo = Number(process.env.MAX_IMAGE_EDGE_PX || 8192);
  const calidadWebp = Number(process.env.WEBP_QUALITY || 86);

  const optimizada = await sharp(archivo.buffer, {
    animated: false,
    limitInputPixels: maximoPixeles,
  })
    .rotate()
    .resize({
      width: bordeMaximo,
      height: bordeMaximo,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: calidadWebp, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const config = configuracion();
  const carpeta = `${config.prefijo}/${publicacionId}/${imagenId}`;
  const nombreOriginal = nombreDescarga(archivo.originalname, tipo.ext);
  const rutaOriginal = `${carpeta}/original.${tipo.ext}`;
  const rutaOptimizada = `${carpeta}/optimizada.webp`;
  const subidas = [];

  try {
    await subirObjeto({
      clave: rutaOriginal,
      buffer: archivo.buffer,
      tipoMime: tipo.mime,
      disposicion: `attachment; filename="${nombreOriginal}"`,
      cacheControl: 'public, max-age=60, must-revalidate',
    });
    subidas.push(rutaOriginal);

    await subirObjeto({
      clave: rutaOptimizada,
      buffer: optimizada.data,
      tipoMime: 'image/webp',
      disposicion: 'inline',
      cacheControl: 'public, max-age=60, must-revalidate',
    });
    subidas.push(rutaOptimizada);

    return {
      id: imagenId,
      rutaOriginal,
      rutaOptimizada,
      nombreOriginal,
      tipoMimeOriginal: tipo.mime,
      tamanoOriginal: archivo.buffer.length,
      tamanoOptimizado: optimizada.data.length,
      ancho: optimizada.info.width || null,
      alto: optimizada.info.height || null,
    };
  } catch (error) {
    await eliminarObjetos(subidas).catch(() => {});
    throw error;
  }
}

function nuevoIdImagen() {
  return crypto.randomUUID();
}

module.exports = {
  eliminarObjetos,
  nuevoIdImagen,
  prepararYSubirImagen,
  urlDescarga,
  urlPublica,
  validarBucket,
};