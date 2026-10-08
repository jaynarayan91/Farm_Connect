const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

// CORS configurationa
app.use(
  cors({
    origin : 'https://8081-fffcdcccddeefadccceeeabbcadcbedb.premiumproject.examly.io',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Ensure Upload Directories Exist ---
const livestockDir = path.join(__dirname, 'uploads', 'livestock');
const medicineDir = path.join(__dirname, 'uploads', 'medicine'); // Added medicine folder

[livestockDir, medicineDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Import Routers ---
const userRouter = require('./routers/userRouter.js');
const feedRouter = require('./routers/feedRouter.js');
const livestockRouter = require('./routers/liveStockRouter.js');
const medicineRouter = require('./routers/medicineRouter.js');
const requestRouter = require('./routers/requestRouter.js');
const feedbackRoutes = require('./routers/feedBackRouter.js');
const analyticsRoutes = require('./routers/analyticsRouter.js');


// --- Use Routers ---
app.use('/api', userRouter);
app.use('/api', feedRouter);
app.use('/api', livestockRouter);
app.use('/api',requestRouter);
app.use('/api',medicineRouter);
app.use('/api', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const port = 8080;

mongoose
  .connect('mongodb://localhost:27017/newfarmDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB - farmconnect database');
    app.listen(port, () =>
      console.log(`FarmConnect backend listening on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = app;
