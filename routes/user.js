const express = require("express")
const router = express.Router()
const multer = require("multer")
const UserController = require("../controllers/user")
const check = require("../middlewares/auth")

//  Configuración de Subida
let storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        // carpeta a la que se va a guardar el archivo
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) =>{
        cb(null, "avatar-"+Date.now()+"-"+file.originalname)
    }
})

const uploads = multer({storage})

// definir rutas. "/prueba-usuario" es la ruta que vamos a apreciar en la barra de navegación y que usaremos en postman para revisar la respuesta que nos manda. 
// UserController.pruebaUser, como podemos ver UserController hace require al archivo user de la carpeta controllers, 
// para posteriormente usar el controlador al que hemos dado el nombre de pruebaUser
router.get("/prueba-usuario", check.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.profile)
// ? parametro opcional
router.get("/list/:page?", check.auth, UserController.list)
router.put("/update", check.auth, UserController.update)
// uploads.single para decir que es una imagen, name del campo "file0"
router.post("/upload",[check.auth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", check.auth, UserController.avatar)

// Exportar router
module.exports = router