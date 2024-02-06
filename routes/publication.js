const express = require("express")
const router = express.Router()
const multer = require("multer")
const PublicationController = require("../controllers/publication")
const check = require("../middlewares/auth")

//  Configuración de Subida
let storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        // carpeta a la que se va a guardar el archivo
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) =>{
        cb(null, "pub-"+Date.now()+"-"+file.originalname)
    }
})
const uploads = multer({storage})

// definir rutas. "/prueba-publication" es la ruta que vamos a apreciar en la barra de navegación y que usaremos en postman para revisar la respuesta que nos manda. 
// UserController.pruebaUser, como podemos ver UserController hace require al archivo user de la carpeta controllers, 
// para posteriormente usar el controlador al que hemos dado el nombre de pruebaUser
router.get("/prueba-publication", PublicationController.pruebaPublication)
router.post("/save", check.auth, PublicationController.save)
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/remove/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?", check.auth, PublicationController.user)
router.post("/upload/:id",[check.auth, uploads.single("file0")], PublicationController.upload)
router.get("/media/:file", PublicationController.media)
router.get("/feed/:page?", check.auth, PublicationController.feed)
// Exportar router
module.exports = router