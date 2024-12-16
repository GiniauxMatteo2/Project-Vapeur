const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const path = require('path');

const app = express();
//const prisma = new PrismaClient();
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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function seed() {
    try {
        // Create some genres
        const genre1 = await prisma.genre.create({
            data: {
                name: "Action",
            },
        });
        const genre2 = await prisma.genre.create({
            data: {
                name: "Adventure",
            },
        });
        // Create some publishers
        const publisher1 = await prisma.gamePublishers.create({
            data: {
                publisher: "Ubisoft",
            },
        });
        const publisher2 = await prisma.gamePublishers.create({
            data: {
                publisher: "Nintendo",
            },
        });
        // Create some games
        await prisma.games.createMany({
            data: [
                {
                    title: "Assassin's Creed",
                    description: "An action-adventure stealth game.",
                    releaseDate: new Date("2007-11-13"),
                    genreId: genre1.id,
                    publishersId: publisher1.id,
                },
                {
                    title: "The Legend of Zelda",
                    description: "An action-adventure game series.",
                    releaseDate: new Date("1986-02-21"),
                    genreId: genre2.id,
                    publishersId: publisher2.id,
                },
                {
                    title: "Far Cry",
                    description: "A first-person shooter game.",
                    releaseDate: new Date("2004-03-23"),
                    genreId: genre1.id,
                    publishersId: publisher1.id,
                },
            ],
        });
        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}
seed();