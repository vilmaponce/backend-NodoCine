// backend/utils/seedProfiles.mjs
import mongoose from 'mongoose';
import { connectDB } from '../db.mjs';
import Profile from '../models/Profile.mjs';

await connectDB();

// Borrar los perfiles existentes para evitar duplicados
await Profile.deleteMany({});

const perfiles = [
  { name: 'Vilma', isChild: false, imageName: 'profile1.png', userId: new mongoose.Types.ObjectId(), watchlist: [], restrictions: [] },
  { name: 'Melina', isChild: true,  imageName: 'profile2.png', userId: new mongoose.Types.ObjectId(), watchlist: [], restrictions: [] },
  { name: 'Marcos', isChild: false, imageName: 'profile3.png', userId: new mongoose.Types.ObjectId(), watchlist: [], restrictions: [] },
  { name: 'Susana', isChild: true,  imageName: 'profile4.png', userId: new mongoose.Types.ObjectId(), watchlist: [], restrictions: [] }
];

try {
  await Profile.insertMany(perfiles);
  console.log('✅ Perfiles insertados exitosamente');
} catch (error) {
  console.error('❌ Error al insertar perfiles:', error);
} finally {
  mongoose.connection.close(); // Cierra la conexión
}

