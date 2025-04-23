import Profile from '../models/Profile.mjs';




// Función para obtener todos los perfiles
export const getAllProfiles = async (req, res) => {
  try {
    // Intenta obtener todos los perfiles de la base de datos
    const profiles = await Profile.find();  // Asegúrate de que este método sea el correcto según tu modelo

    if (profiles.length === 0) {
      // Si no hay perfiles en la base de datos, devuelve un mensaje adecuado
      return res.status(404).json({ message: 'No se encontraron perfiles' });
    }

    // Si hay perfiles, devuelve los resultados
    res.json(profiles);
  } catch (err) {
    // En caso de error, muestra el mensaje de error
    console.error(err);
    res.status(500).json({ message: 'Error al obtener los perfiles' });
  }
};

  

// Crear un perfil
export const createProfile = async (req, res) => {
  const { userId } = req.user; // Asumiendo que el middleware 'authenticate' establece 'req.user'
  const { name, age, bio } = req.body;

  try {
    const profile = new Profile({
      userId,
      name,
      age,
      bio
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error al crear el perfil:', error);
    res.status(500).json({ message: 'Error al crear el perfil' });
  }
};

// Ejemplo de controlador que obtiene los perfiles
export const getProfilesByUser = (req, res) => {
  console.log('Buscando perfiles para el usuario:', req.params.userId);
  // Aquí haces la consulta a la base de datos
  Profile.find({ userId: req.params.userId })
    .then(profiles => {
      console.log('Perfiles encontrados:', profiles);
      res.json(profiles);
    })
    .catch(err => {
      console.error('Error al obtener los perfiles:', err);
      res.status(500).json({ error: 'Error al obtener los perfiles' });
    });
};




// Actualizar un perfil
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, age, bio } = req.body;

  try {
    const profile = await Profile.findByIdAndUpdate(id, { name, age, bio }, { new: true });
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

// Eliminar un perfil
export const deleteProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await Profile.findByIdAndDelete(id);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }
    res.json({ message: 'Perfil eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el perfil:', error);
    res.status(500).json({ message: 'Error al eliminar el perfil' });
  }
};

// Agregar a la watchlist
export const addToWatchlist = async (req, res) => {
  const { id } = req.params;
  const { movieId } = req.body;

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    // Verificar si la película ya está en la watchlist
    if (profile.watchlist.includes(movieId)) {
      return res.status(400).json({ message: 'La película ya está en la watchlist' });
    }

    profile.watchlist.push(movieId);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error al agregar a la watchlist:', error);
    res.status(500).json({ message: 'Error al agregar la película a la watchlist' });
  }
};

// Obtener la watchlist
export const getWatchlist = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await Profile.findById(id).populate('watchlist');
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }
    res.json(profile.watchlist);
  } catch (error) {
    console.error('Error al obtener la watchlist:', error);
    res.status(500).json({ message: 'Error al obtener la watchlist' });
  }
};

// Eliminar de la watchlist
export const removeFromWatchlist = async (req, res) => {
  const { id, movieId } = req.params;

  try {
    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    // Eliminar la película de la watchlist
    profile.watchlist = profile.watchlist.filter(movie => movie.toString() !== movieId);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error al eliminar de la watchlist:', error);
    res.status(500).json({ message: 'Error al eliminar la película de la watchlist' });
  }
};
