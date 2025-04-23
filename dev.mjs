// // backend/dev.mjs
// import 'dotenv/config';
// import { connectDB, disconnectDB } from './db.mjs'; // Usa tu archivo principal
// import mongoose from 'mongoose';

// const inspectCollections = async () => {
//   try {
//     await connectDB();
//     console.log('✅ Conexión establecida');
//     console.log('📌 Colecciones disponibles:');
    
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     collections.forEach(collection => {
//       console.log(`- ${collection.name}`);
//     });
    
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   } finally {
//     await disconnectDB();
//   }
// };

// inspectCollections();