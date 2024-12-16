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

const genresRoutes = require('./routes/genres'); // Routes requise pour les genres
app.use('/genres', genresRoutes);


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

//Helper global pour formater l'heure
hbs.registerHelper("formatTime", (dateString) => {
    if (!dateString) return "Date non disponible";
   
    const date = new Date(dateString);
 
    // Formatage natif : jour/mois/année, heure:minute
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour12: false,
    };
 
    return date.toLocaleString("fr-FR", options);
  });

// Helper pour formater une date en "YYYY-MM-DD" (format HTML5)
hbs.registerHelper("formatForInput", (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mois entre 01-12
  const day = String(date.getDate()).padStart(2, "0"); // Jour entre 01-31

  return `${year}-${month}-${day}`;
});

