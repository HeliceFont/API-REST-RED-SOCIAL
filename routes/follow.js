const express = require("express")
const router = express.Router()
const FollowController = require("../controllers/follow")
const check = require("../middlewares/auth")

// definir rutas. "/prueba-publication" es la ruta que vamos a apreciar en la barra de navegación y que usaremos en postman para revisar la respuesta que nos manda. 
// UserController.pruebaUser, como podemos ver UserController hace require al archivo user de la carpeta controllers, 
// para posteriormente usar el controlador al que hemos dado el nombre de pruebaUser
router.get("/prueba-follow", FollowController.pruebaFollow)
router.post("/save", check.auth, FollowController.save)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)
router.get("/following/:id?/:page?", check.auth, FollowController.following)
router.get("/followers/:id?/:page?", check.auth, FollowController.followers)
// Exportar router
module.exports = router