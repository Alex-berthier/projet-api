const express = require('express');
const app = express();
const mysql = require('mysql');
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: '192.168.65.228', // L'hôte de la base de données
  user: 'userweb', // Votre nom d'utilisateur MySQL
  password: 'T100403w(', // Votre mot de passe MySQL
  database: 'Projet-api' // Le nom de votre base de données
});

// Connexion à la base de données
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    throw err;
  }
  console.log('Connecté à la base de données MySQL');
});



// Configuration d'une route pour la racine "/"
app.get('/', (req, res) => {
  /*let temp = Math.floor(Math.random() * (36 - (-10) + 1)) + (-10);
  res.send('Bonjour, la température est de !'+temp);*/
  connection.query('SELECT * FROM Joueur', (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err);
      res.status(500).send('Erreur lors de la requête SQL');
      return;
    }

    // Envoi des résultats en tant que réponse JSON
    res.json(results);
  });
});



// Écoute du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Serveur Expre ss en cou  rs d'exécution sur le port ${port}`);
});

//la commande pour retrouver les PID en écoute est :  lsof -i -P -n | grep LISTEN

app.post('/addUser', (req, res) => {

  const { Nom, Prenom, Age } = req.body;

  if (!Nom || !Prenom || !Age) {
    return res.status(400).json({ message: 'nom, prenom et age requis' });

  }

  // Requête d'insertion
  const sql = 'INSERT INTO Joueur (Nom, Prenom, Age) VALUES (?, ?, ?)';

  // Exécute la requête
  connection.query(sql, [Nom, Prenom, Age], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête d\'insertion :', err);
      res.status(500).send('Erreur lors de l\'insertion des données');
      return;
    }

    /*
      1xx : code d’information

      2xx : code de succès

      3xx : code de redirection

      4xx : code d’erreur côté client

      5xx : code d’erreur côté serveur
    */

    //je rajoute au json une cles success à true que j'utilise dans le front
    //cette clé me permetra de vérifier que l'api s'est bien déroulé
    req.body.success = true;
    res.json(req.body);
  });


});


app.post('/ratio', (req, res) => {
  const nom = req.body.nom;

  // Vérifier si le nom est présent dans le corps de la requête
  if (!nom) {
    res.status(400).json({ erreur: "Nom manquant dans la requête" });
    return;
  }

  // Requête SQL pour récupérer le ratio v/d du joueur
  const query = `SELECT Statistique.ratio_vd
  FROM Joueur
  INNER JOIN Statistique ON Joueur.idJoueur = Statistique.idJoueur
  WHERE Joueur.Nom = ?`;
  console.log("Recherche effectué")
  // Exécution de la requête avec le nom du joueur en paramètre
  connection.query(query, [nom], (error, results) => {
    if (error) {
      console.error("Erreur lors de l'exécution de la requête :", error);
      console.log("Erreur lors de la requête")
      res.status(500).json({ erreur: "Erreur lors de l'exécution de la requête" });
      return;
    }

    // Vérification si le joueur existe dans la base de données
    if (results.length === 0) {
      res.status(404).json({ erreur: "Joueur non trouvé dans la base de données" });
      return;
    }

    // Renvoyer le ratio v/d du joueur
    res.json({ ratio_vd: results[0].ratio_vd });
  });
});
