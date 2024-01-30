// Importar Modelo
const follow = require("../models/follow")
const User = require("../models/user")



// Acciones de prueba
const pruebaFollow =(req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/follow.js"
    })
}

// Acción de guardar un follow (acción de seguir)
const save = (req,res) =>{
    return res.status(200).send({
        status: "succes",
        message: "Metodo dar follow"
    })
}

// Acción de eliminar un follow (acción dejar de seguir)

// Accion de listado de uruarios que estoy siguiendo

// Acción Listado de usuarios que me siguen


// Exportar acciones
module.exports ={
    pruebaFollow, 
    save
}