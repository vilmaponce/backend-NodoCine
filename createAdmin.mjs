import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './models/User.mjs';
import 'dotenv/config';

// Especificar explícitamente la base de datos NodoCine
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NodoCine';

async function createAdmin() {
  try {
    // Conectar a MongoDB, especificando la base de datos
    await mongoose.connect(MONGODB_URI, {
      dbName: 'NodoCine'  // Asegurar que use esta base de datos
    });
    console.log('Conectado a MongoDB');
    console.log('Base de datos:', mongoose.connection.db.databaseName);
    
    // Nombre de la colección
    const collectionName = User.collection.collectionName;
    console.log('Nombre de colección:', collectionName);
    
    // Eliminar usuario admin si existe
    console.log('Eliminando usuario admin existente...');
    const deleteResult = await User.deleteOne({ email: 'admin@admin.com' });
    console.log('Resultado eliminación:', deleteResult);
    
    // Datos del nuevo admin
    const adminData = {
      username: 'admin',
      email: 'admin@admin.com',
      password: await bcryptjs.hash('admin123', 10),
      isAdmin: true
    };
    
    // Crear nuevo usuario admin
    console.log('Creando nuevo usuario admin...');
    const newAdmin = new User(adminData);
    await newAdmin.save();
    console.log('Admin creado:', newAdmin.email);
    console.log('Datos completos:', {
      id: newAdmin._id,
      email: newAdmin.email,
      passwordPresent: !!newAdmin.password,
      isAdmin: newAdmin.isAdmin
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar la función
createAdmin();