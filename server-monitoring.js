const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

// Servir les fichiers statiques
app.use(express.static("public"));

server.listen(80, "0.0.0.0", () => {
  console.log("Serveur lancé sur http://localhost:80");
});