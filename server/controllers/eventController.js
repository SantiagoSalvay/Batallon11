const fs = require('fs');
const prisma = require('../config/prisma');
const { fileToPublicUrl, deleteOldFileFromUrl } = require('../utils/fileUrl');
const { uploadDir } = require('../middleware/upload');
const { audit } = require('../utils/auditLog');

async function listEvents(req, res, next) {
  try {
    const onlyUpcoming = req.query.upcoming === 'true';
    const where = onlyUpcoming ? { date: { gte: new Date() } } : {};
    const events = await prisma.evento.findMany({
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
    const event = await prisma.evento.findUnique({
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
    const data = {
      title,
      description,
      date: new Date(date),
      location: location || null,
    };
    if (req.file) data.imageUrl = fileToPublicUrl(req.file);

    const event = await prisma.evento.create({ data });
    audit(req, 'event.create', { eventId: event.id });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.evento.findUnique({ where: { id } });
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
    const event = await prisma.evento.update({ where: { id }, data });
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await prisma.evento.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Evento no encontrado' });
    await prisma.evento.delete({ where: { id } });
    deleteOldFileFromUrl(fs, current.imageUrl, uploadDir);
    audit(req, 'event.delete', { eventId: id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };
