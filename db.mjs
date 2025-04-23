// db.mjs
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NodoCine';

// Configuración de conexión
const connectionOptions = {
  dbName: process.env.DB_NAME || 'NodoCine',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
};

// Conexión principal
mongoose.connect(MONGODB_URI, connectionOptions)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection Error:', err));

// Exporta tanto mongoose como las funciones de conexión
export const db = mongoose.connection;
export default mongoose;

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, connectionOptions);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}