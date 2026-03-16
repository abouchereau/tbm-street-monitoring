const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

server.listen(8080, "0.0.0.0", () => {
  console.log("Serveur lancé sur http://localhost:8080");
});