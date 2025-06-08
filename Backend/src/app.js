const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const measurementRoutes = require('./routes/measurement');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/measurements', measurementRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
