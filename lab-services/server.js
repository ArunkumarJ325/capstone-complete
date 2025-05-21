const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const labDetailsRoutes = require('./routes/labDetails.routes');
const labTestRoutes = require('./routes/labTest.routes');
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};



const app = express();

// Middleware
app.use(bodyParser.json());
//app.use(cors());
app.use(cors(corsOptions));


// Routes
app.use('/api/labs', labDetailsRoutes);
app.use('/api/lab-tests', labTestRoutes);
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/lab-service';

// Connect to MongoDB
mongoose.connect(mongoUrl)
  .then(() => console.log(`Connected to MongoDB at ${mongoUrl}`))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Start the server
const port = process.env.PORT || 5008;
app.listen(port, () => {
  console.log(`Lab service running on port ${port}`);
});