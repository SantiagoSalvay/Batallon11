const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');

async function listEvents(req, res, next) {
  try {
    const onlyUpcoming = req.query.upcoming === 'true';
    const where = onlyUpcoming ? { date: { gte: new Date() } } : {};
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!event) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, description, date, location } = req.body;
    if (!title || !description || !date) {
      return res
        .status(400)
        .json({ message: 'title, description y date son requeridos' });
    }
    const data = {
      title,
      description,
      date: new Date(date),
      location: location || null,
    };
    if (req.file) data.imageUrl = fileToPublicUrl(req.file);

    const event = await prisma.event.create({ data });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.event.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Evento no encontrado' });

    const { title, description, date, location } = req.body;
    const data = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(location !== undefined && { location }),
    };
    if (req.file) {
      data.imageUrl = fileToPublicUrl(req.file);
      deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    }
    const event = await prisma.event.update({ where: { id }, data });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.event.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Evento no encontrado' });
    await prisma.event.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };
