const { z } = require('zod');

const publishedField = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true')
  .optional()
  .default(true);

const postBodySchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(200),
  content: z.string().trim().min(1, 'El contenido es obligatorio').max(50_000),
  published: publishedField,
});

const publishedFieldOptional = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true')
  .optional();

const postBodyUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).max(50_000).optional(),
  published: publishedFieldOptional,
});

const stagePostBodySchema = postBodySchema.extend({
  stageSlug: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Slug inválido'),
});

const stagePostBodyUpdateSchema = stagePostBodySchema.partial();

const eventBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10_000),
  date: z.string().min(1, 'La fecha es obligatoria'),
  location: z.string().trim().max(300).optional().nullable(),
});

const eventBodyUpdateSchema = eventBodySchema.partial();

const galleryImageSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  order: z.coerce.number().int().min(0).optional(),
});

const stageGalleryImageSchema = galleryImageSchema.extend({
  stageSlug: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Slug inválido'),
});

module.exports = {
  postBodySchema,
  postBodyUpdateSchema,
  stagePostBodySchema,
  stagePostBodyUpdateSchema,
  eventBodySchema,
  eventBodyUpdateSchema,
  galleryImageSchema,
  stageGalleryImageSchema,
};
