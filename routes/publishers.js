const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

// Redirect to the index.hbs page showing all publishers
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

// Show games by a specific publisher
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

    // Find all games associated with the publisher
    const games = await prisma.games.findMany({
      where: { publishersId: publisherId },
    });

    //  Extract game IDs
    const gameIds = games.map(game => game.id);

    // Delete all features linked to these games
    await prisma.gameFeatures.deleteMany({
      where: { gameId: { in: gameIds } },
    });

    // Delete all games linked to the publisher
    await prisma.games.deleteMany({
      where: { publishersId: publisherId },
    });

    // Delete the publisher itself
    await prisma.gamePublishers.delete({
      where: { id: publisherId },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression de l’éditeur.');
  }
});


// Create a new publisher
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

// Display form to edit a publisher
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the publisher by ID
    const publisher = await prisma.gamePublishers.findUnique({
      where: { id: parseInt(id) },
    });

    if (!publisher) {
      return res.status(404).send('Publisher not found.');
    }

    // Render an edit form
    res.render('publishers/edit', { publisher });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching publisher.');
  }
});

// Update a publisher's name
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { publisherName } = req.body;

  try {
    // Update the publisher's name
    await prisma.gamePublishers.update({
      where: { id: parseInt(id) },
      data: { publisher: publisherName },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating publisher.');
  }
});


module.exports = router;
