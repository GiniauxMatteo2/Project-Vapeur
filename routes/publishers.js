const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Afficher la liste des éditeurs (triée par ordre alphabétique)
router.get('/', async (req, res) => {
  try {
    const publishers = await prisma.gamePublishers.findMany({
      distinct: ['publisher'], // Supprimer les doublons d'éditeurs
      orderBy: { publisher: 'asc' },
    });
    res.render('publishers/list', { publishers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des éditeurs.');
  }
});

// Afficher les jeux d’un éditeur spécifique
router.get('/:publisher/games', async (req, res) => {
  const { publisher } = req.params;

  try {
    // Fetch all game publishers with the specified publisher name
    const publishersWithGames = await prisma.gamePublishers.findMany({
      where: { publisher },
      include: { games: true }, // Include related games
    });

    // Extract all games into a single array
    const games = publishersWithGames.flatMap(publisher => publisher.games);

    // Log the games for debugging purposes
    console.log(games);

    // Render the template with the list of games
    res.render('publishers/games', { publisher, games });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des jeux de cet éditeur.');
  }
});


// Créer un nouvel éditeur
router.post('/create', async (req, res) => {
  const { publisher, gameId } = req.body;

  try {
    const newPublisher = await prisma.gamePublishers.create({
      data: {
        publisher,
        gameId: parseInt(gameId),
      },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la création de l’éditeur.');
  }
});

// Modifier un éditeur
router.post('/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { publisher } = req.body;

  try {
    await prisma.gamePublishers.update({
      where: { id: parseInt(id) },
      data: { publisher },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la modification de l’éditeur.');
  }
});

// Supprimer un éditeur
router.post('/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.gamePublishers.delete({
      where: { id: parseInt(id) },
    });

    res.redirect('/publishers');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la suppression de l’éditeur.');
  }
});

module.exports = router;
