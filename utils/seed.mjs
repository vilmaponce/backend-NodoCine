import { connectDB, disconnectDB } from '../db.mjs';
import Movie from '../models/Movie.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    console.log('🔃 Conectando a MongoDB...');
    await connectDB();

    // 1. Leer el archivo JSON
    const dataPath = path.join(__dirname, '../data/movies.json');
    const moviesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log(`📖 Leyendo ${moviesData.length} películas del archivo JSON`);

    // 2. Limpiar colección existente
    console.log('🗑️ Limpiando colección...');
    const { deletedCount } = await Movie.deleteMany({});
    console.log(`Eliminadas ${deletedCount} películas existentes`);

    // 3. Insertar nuevas películas
    console.log('📥 Insertando películas...');
    const result = await Movie.insertMany(moviesData);
    console.log(`🎉 Insertadas ${result.length} películas correctamente`);

    // Mostrar resumen
    result.forEach(movie => {
      console.log(`- ${movie.title} (${movie.year})`);
    });

  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();