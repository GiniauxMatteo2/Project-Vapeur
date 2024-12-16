const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Route to display genres
router.get('/', async (req, res) => {
    try {
        // Fetch all genres
        const genres = await prisma.genre.findMany();
        
        // Render the showgenre.hbs template and pass genres
        res.render("genres", { genres });
    } catch (error) {
        console.error("Error fetching genres:", error.message);
        res.status(500).send("An error occurred while fetching genres.");
    }
});




// Route to display games for a specific genre
router.get("/:id/games", async (req, res) => {
    try {
        const genreId = parseInt(req.params.id, 10);

        // Fetch the genre and its associated games
        const genreWithGames = await prisma.genre.findUnique({
            where: { id: genreId },
            include: {
                games: true, // Include associated games
            },
        });

        if (!genreWithGames) {
            return res.status(404).send("Genre not found.");
        }

        // Render the showgames.hbs template with the genre and its games
        res.render("genres/showgames", {
            genre: genreWithGames.name, // Genre name
            games: genreWithGames.games, // Games for the selected genre
        });
    } catch (error) {
        console.error("Error fetching games for genre:", error.message);
        res.status(500).send("An error occurred while fetching games for this genre.");
    }
});

module.exports = router;