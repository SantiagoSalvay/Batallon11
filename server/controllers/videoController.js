const prisma = require('../config/prisma');

async function getVideo(_req, res, next) {
  try {
    let video = await prisma.videoSection.findFirst();
    if (!video) {
      video = await prisma.videoSection.create({
        data: {
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Nuestro batallón',
        },
      });
    }
    res.json(video);
  } catch (err) {
    next(err);
  }
}

async function updateVideo(req, res, next) {
  try {
    const { videoUrl, title, subtitle } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ message: 'videoUrl es requerido' });
    }

    const current = await prisma.videoSection.findFirst();
    const data = { videoUrl, title, subtitle };

    const video = current
      ? await prisma.videoSection.update({ where: { id: current.id }, data })
      : await prisma.videoSection.create({ data });

    res.json(video);
  } catch (err) {
    next(err);
  }
}

module.exports = { getVideo, updateVideo };
