const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function getHero(_req, res, next) {
  try {
    let hero = await prisma.heroSection.findFirst();
    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {
          heroTitle: 'Batallón 11 General José María Paz',
          heroSubtitle: 'Exploradores Argentinos de Don Bosco',
        },
      });
    }
    res.json(hero);
  } catch (err) {
    next(err);
  }
}

async function updateHero(req, res, next) {
  try {
    const { heroTitle, heroSubtitle, ctaText, ctaLink } = req.body;

    const current = await prisma.heroSection.findFirst();

    const data = {
      ...(heroTitle !== undefined && { heroTitle }),
      ...(heroSubtitle !== undefined && { heroSubtitle }),
      ...(ctaText !== undefined && { ctaText }),
      ...(ctaLink !== undefined && { ctaLink }),
    };

    if (req.file) {
      data.heroImage = fileToPublicUrl(req.file);
      if (current?.heroImage) {
        deleteOldFileFromUrl(fs, current.heroImage, uploadDir);
      }
    }

    const hero = current
      ? await prisma.heroSection.update({ where: { id: current.id }, data })
      : await prisma.heroSection.create({
          data: { heroTitle: heroTitle || 'Batallón 11', ...data },
        });

    res.json(hero);
  } catch (err) {
    next(err);
  }
}

module.exports = { getHero, updateHero };
