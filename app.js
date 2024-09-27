
import express from 'express';
import bodyParser from 'body-parser';
import { connectToDatabase } from './src/config/databaseConnection.js';
import paymentRouter from './src/routes/pyments.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import postRoutes from './src/routes/posts.routes.js';
import morgan from 'morgan';
import cloudinary from 'cloudinary';
import bookingRoute from './src/routes/booking.routes.js';


const app = express();

const PORT = process.env.PORT || 3000;
// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));

connectToDatabase()

// routers
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/booking', bookingRoute);
app.use('/payment', paymentRouter);

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// app listener
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
