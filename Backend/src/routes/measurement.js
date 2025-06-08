const express = require('express');
const {
  getAllMeasurements,
  getMeasurementById,
  createMeasurement,
} = require('../controllers/measurementController');

const router = express.Router();

router.get('/', getAllMeasurements);
router.get('/:id', getMeasurementById);
router.post('/', createMeasurement);

module.exports = router;
