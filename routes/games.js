const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));

const path = require("path");
router.use(express.static(path.join(__dirname, "public")));

router.get("/", async (req, res) => {
    const games = await prisma.games.findMany({
        include: {
            genre: true,  
            publishers: true,  
        },
    });
    res.render("games/index", { games });
});

router.post("/:id/delete/", async (req, res) => {
    const { id } = req.params;
    
    try {
        // Utilisation de Prisma pour supprimer le jeu basé sur l'ID
        await prisma.games.delete({
          where: { id: Number(id) }, 
        });
    
        console.log(`Le jeu avec l'ID ${id} a été supprimé avec succès.`);
        res.redirect("/games"); // Redirige vers la liste des jeux après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression du jeu :", error);
        res.status(500).send("Une erreur est survenue lors de la suppression du jeu.");
      }
  });

// Route pour afficher un jeu par ID
router.get("/:id/details/", async (req, res) => {
    const gameId = parseInt(req.params.id);
  
    if (isNaN(gameId)) {
      return res.status(400).send("ID de jeu invalide");
    }
  
    try {
      const game = await prisma.games.findUnique({
        where: { id: gameId },
        include: {
          genre: true,
          publishers: true,
        },
      });
  
      if (!game) {
        return res.status(404).send("Jeu non trouvé");
      }
  
      res.render("games/details", { game });
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la récupération du jeu");
    }
  });
  

// Route pour afficher le formulaire d'édition
router.get("/:id/edit", async (req, res) => {
    const gameId = parseInt(req.params.id);
  
    // Récupérer les informations du jeu
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      include: { genre: true, publishers: true },
    });
  
    if (!game) {
      return res.status(404).send("Jeu introuvable !");
    }
  
    // Récupérer les genres et éditeurs disponibles pour les listes déroulantes
    const genres = await prisma.genre.findMany();
    const publishers = await prisma.gamePublishers.findMany();
  
    res.render("games/edit", { game, genres, publishers });
  });
  
// Route pour traiter la soumission du formulaire d'édition
router.post("/:id/edit", async (req, res) => {
const gameId = parseInt(req.params.id);
const { title, description, releaseDate, genreId, publishersId } = req.body;

try {
    await prisma.games.update({
    where: { id: gameId },
    data: {
        title,
        description,
        releaseDate: new Date(releaseDate),
        genreId: parseInt(genreId),
        publishersId: parseInt(publishersId),
    },
    });
    res.redirect(`/games/${gameId}/details`);
} catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la mise à jour du jeu !");
}
});
  


// Route pour afficher le formulaire de création d'un jeu
router.get("/new", async (req, res) => {
    try {
      const genres = await prisma.genre.findMany(); // Récupérer les genres
      const publishers = await prisma.gamePublishers.findMany(); // Récupérer les éditeurs
  
      res.render("games/new", { genres, publishers });
    } catch (error) {
      console.error("Erreur lors de la récupération des genres ou éditeurs:", error);
      res.status(500).send("Erreur lors de la récupération des données.");
    }
  });
  
  
// Traiter le formulaire de création d'un nouveau jeu
router.post("/new", async (req, res) => {
    const { title, description, releaseDate, genreId, publishersId } = req.body;

    // Créer un nouveau jeu dans la base de données
    const newGame = await prisma.games.create({
        data: {
        title,
        description,
        releaseDate: new Date(releaseDate), 
        genreId: parseInt(genreId),
        publishersId: parseInt(publishersId),
        },
    });

    // Rediriger vers la page du jeu nouvellement créé
    res.redirect(`/games/`);
});

  




module.exports = router;
