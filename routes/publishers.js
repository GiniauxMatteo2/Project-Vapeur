const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bodyParser = require('body-parser');
// make it so we can acess the data of features/change (now can parse url-encoded data from forms)
router.use(bodyParser.urlencoded({ extended: true }));

// Route 1: Redirect to the index.hbs page showing all publishers
router.get('/', async (req, res) => {
  try {
    const publishers = await prisma.gamePublishers.findMany({
      orderBy: { publisher: 'asc' }, // Sort publishers alphabetically
    });
    res.render('publishers/index', { publishers }); // Render index.hbs
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des éditeurs.');
  }
});

// Route 2: Show games by a specific publisher
router.get('/game/:publisher', async (req, res) => {
  const { publisher } = req.params;

  try {
    const publishersWithGames = await prisma.gamePublishers.findMany({
      where: { publisher },
      include: { games: true }, // Include associated games
    });

    const games = publishersWithGames.flatMap(p => p.games);
    res.render('publishers/games', { publisher, games }); // Render games.hbs
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des jeux de cet éditeur.');
  }
});

// Delete a publisher and its associated games and features
router.post('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const publisherId = parseInt(id);

    // Step 1: Find all games associated with the publisher
    const games = await prisma.games.findMany({
      where: { publishersId: publisherId },
    });

    // Step 2: Extract game IDs
    const gameIds = games.map(game => game.id);

    // Step 3: Delete all features linked to these games
    await prisma.gameFeatures.deleteMany({
      where: { gameId: { in: gameIds } },
    });

    // Step 4: Delete all games linked to the publisher
    await prisma.games.deleteMany({
      where: { publishersId: publisherId },
    });

    // Step 5: Delete the publisher itself
    await prisma.gamePublishers.delete({
      where: { id: publisherId },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression de l’éditeur.');
  }
});



// Route 4: Create a new publisher
router.post('/new', async (req, res) => {
  const { publisher } = req.body;

  try {
    await prisma.gamePublishers.create({
      data: { publisher }, // Create a new publisher
    });
    res.redirect('/publishers'); // Redirect to index after creation
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la création de l’éditeur.');
  }
});

module.exports = router;
