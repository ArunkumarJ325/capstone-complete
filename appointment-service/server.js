const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/appointment/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'appointment-service' });
});

// Routes
app.use('/api/appointment', appointmentRoutes);
// Use MONGO_URL if provided, otherwise fallback to local MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/appointment-service';

// MongoDB connection
mongoose.connect(mongoUrl)
  .then(() => console.log(`Connected to MongoDB at ${mongoUrl}`))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Start server
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Appointment service running on port ${port}`);
});