import Movie from '../models/Movie.mjs';
import axios from 'axios';

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().select('-__v').lean();
    
    if (!movies.length) {
      return res.status(404).json({ 
        message: 'No hay películas en la base de datos',
        suggestion: 'Agrega películas desde el panel de administración'
      });
    }

    res.json(movies.map(movie => ({
      ...movie,
      posterUrl: movie.imageUrl || '/default-movie.jpg',
      backdropUrl: movie.backdropUrl || '/default-backdrop.jpg'
    })));
    
  } catch (error) {
    console.error("Error en getMovies:", error);
    res.status(500).json({ 
      error: 'Error al obtener películas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar en nuestra base de datos primero
    const localMovie = await Movie.findOne({ 
      $or: [{ _id: id }, { externalId: id }] 
    }).lean();

    // 2. Si no encontramos en DB y es ID de IMDB (tt...)
    if (!localMovie && id.startsWith('tt')) {
      return await fetchFromOMDB(id, res);
    }

    // 3. Si encontramos en DB pero no tiene externalId
    if (localMovie && !localMovie.externalId) {
      return res.json({
        ...localMovie,
        source: 'local',
        warning: 'Esta película no tiene enlace con OMDB'
      });
    }

    // 4. Si tenemos externalId, buscar en OMDB
    if (localMovie?.externalId) {
      try {
        const omdbData = await fetchOMDBData(localMovie.externalId);
        return res.json({
          ...localMovie,
          ...omdbData,
          source: 'hybrid'
        });
      } catch (omdbError) {
        console.warn("Error OMDB, fallback a local:", omdbError);
        return res.json({
          ...localMovie,
          source: 'local-fallback'
        });
      }
    }

    // 5. No encontrado
    return res.status(404).json({ 
      error: 'Película no encontrada',
      triedId: id
    });

  } catch (error) {
    console.error("Error en getMovieDetails:", error);
    res.status(500).json({ 
      error: 'Error al obtener detalles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper para consultar OMDB
const fetchOMDBData = async (imdbId) => {
  const response = await axios.get(
    `https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}&plot=full`,
    { timeout: 3000 }
  );

  if (response.data.Response === "False") {
    throw new Error(response.data.Error || "Datos no encontrados en OMDB");
  }

  const { Title, Year, Genre, Plot, Poster, imdbRating, Director, Actors, Runtime } = response.data;
  
  return {
    omdbTitle: Title,
    year: Year,
    genre: Genre,
    plot: Plot,
    imageUrl: Poster !== 'N/A' ? Poster : null,
    rating: parseFloat(imdbRating) || 0,
    director: Director,
    actors: Actors?.split(", "),
    runtime: Runtime,
    imdbId: imdbId
  };
};