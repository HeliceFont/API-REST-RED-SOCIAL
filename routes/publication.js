const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication")

// definir rutas. "/prueba-publication" es la ruta que vamos a apreciar en la barra de navegación y que usaremos en postman para revisar la respuesta que nos manda. 
// UserController.pruebaUser, como podemos ver UserController hace require al archivo user de la carpeta controllers, 
// para posteriormente usar el controlador al que hemos dado el nombre de pruebaUser
router.get("/prueba-publication", PublicationController.pruebaPublication)

// Exportar router
module.exports = router