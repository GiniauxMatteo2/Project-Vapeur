const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = 3008;


const publisherRoutes = require('./routes/publishers'); // Routes requise pour les éditeurs
app.use('/publishers', publisherRoutes);

// Configuration de Handlebars pour Express
app.set("view engine", "hbs"); // On définit le moteur de template que Express va utiliser
app.set("views", path.join(__dirname, "views")); // On définit le dossier des vues (dans lequel se trouvent les fichiers .hbs)

hbs.registerPartials(path.join(__dirname, "views", "partials")); // On définit le dossier des partials (composants e.g. header, footer, menu...)

// On définit un middleware pour parser les données des requêtes entrantes.
// Cela permet de récupérer les données envoyées via des formulaires et les rendre disponibles dans req.body.
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", async (req, res) => {
    // on passe seulement le nom du fichier .hbs sans l'extention.
    // Le chemin est relatif au dossier `views`.
    // On peut aller chercher des templates dans les sous-dossiers (e.g. `movies/details`).
    res.render("index");
});

// Route to display genres
app.get("/genres", async (req, res) => {
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


// Route to display genre details (including games in each genre)
app.get("/genres/show", async (req, res) => {
    try {
        const genres = await prisma.genre.findMany({
            include: { games: true }, // Fetch associated games
        });
        res.render("genres/show", { genres });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching genre details.");
    }
});


// Route to display games for a specific genre
app.get("/genres/:id/games", async (req, res) => {
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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

