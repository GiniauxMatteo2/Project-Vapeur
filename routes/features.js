const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bodyParser = require('body-parser');


// make it so we can acess the data of features/change (now can parse url-encoded data from forms)
router.use(bodyParser.urlencoded({ extended: true }));


// GET: Display all Featured Games
router.get('/', async (req, res) => {
  try {
    // Fetch all featured games with game details
    const featuredGames = await prisma.gameFeatures.findMany({
      include: { game: true }, // Include the game details
    });

    res.render('features/index', { featuredGames });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching featured games.');
  }
});



router.get('/change', async (req, res) => {
    try {
      // Fetch all genres with their associated games, and include the gameFeatures relation
      const genres = await prisma.genre.findMany({
        include: {
          games: {
            include: {
              feature: true, // Include the feature relation to check if a game is featured
            },
          },
        },
      });
  
      // Create a structure for games grouped by genre
      const gamesByGenre = {};
      genres.forEach((genre) => {
        gamesByGenre[genre.name] = genre.games.map((game) => ({
          ...game,
          isFeatured: game.feature.length > 0, // If there are any entries in gameFeatures, it's featured
        }));
      });
  
      // Render the 'change' page with games grouped by genre
      res.render('features/change', { gamesByGenre });
    } catch (err) {
      console.error('Error fetching games for selection:', err);
      res.status(500).send('Error fetching games for selection.');
    }
  });
  
  
// Add featured game
router.post('/add', async (req, res) => {
    const { gameIds } = req.body;
    
    try {
      const count = await prisma.gameFeatures.count();
      if (count >= 6) {
        return res.render('features/change', { message: 'Maximum number of featured games reached.' });
      }
    
      const selectedGameIds = Array.isArray(gameIds) ? gameIds : [gameIds];
    
      // Check if any selected game is already featured
      const existingGames = await prisma.gameFeatures.findMany({
        where: { gameId: { in: selectedGameIds.map(id => parseInt(id)) } }
      });
    
      const existingGameIds = existingGames.map(game => game.gameId);
      const newGameIds = selectedGameIds.filter(id => !existingGameIds.includes(id));
    
      // If more games are selected than available slots, return an error
      if (newGameIds.length + count > 6) {
        return res.render('features/change', { message: 'Cannot add more than 6 featured games.' });
      }
    
      // Add new featured games
      const newFeatures = newGameIds.map(gameId => ({ gameId: parseInt(gameId) }));
      await prisma.gameFeatures.createMany({ data: newFeatures });
    
      res.redirect('/features');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding featured game.');
    }
  });
  
  // Delete featured game
  router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      await prisma.gameFeatures.delete({
        where: { id: parseInt(id) },
      });
    
      res.redirect('/features');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error removing the featured game.');
    }
  });
  
module.exports = router;
