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
  } else {
    console.log('✅ MongoDB ya está conectado');
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

// Manejo de eventos de la conexión
db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

db.on('connected', () => {
  console.log('✅ MongoDB is connected');
});

db.on('disconnected', () => {
  console.log('❌ MongoDB is disconnected');
});

// Cerrar la conexión cuando la aplicación termine
process.on('SIGINT', async () => {
  await disconnectDB();
  console.log('🛑 MongoDB disconnected due to app termination');
  process.exit(0);
});