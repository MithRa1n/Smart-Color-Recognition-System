const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllMeasurements = async (req, res) => {
  try {
    const measurements = await prisma.measurement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
};

const getMeasurementById = async (req, res) => {
  try {
    const { id } = req.params;
    const measurement = await prisma.measurement.findUnique({
      where: { id: Number(id) },
    });

    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }

    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch measurement' });
  }
};

const createMeasurement = async (req, res) => {
  try {
    const { red, green, blue } = req.body;

    if (!red || !green || !blue) {
      return res.status(400).json({ message: 'All color values are required' });
    }

    const newMeasurement = await prisma.measurement.create({
      data: { red, green, blue },
    });

    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create measurement' });
  }
};

module.exports = {
  getAllMeasurements,
  getMeasurementById,
  createMeasurement,
};
