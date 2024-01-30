// Importar Modelo
const follow = require("../models/follow")
const User = require("../models/user")


// Acciones de prueba
const pruebaFollow =(req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/follow.js"
    })
}

// Exportar acciones
module.exports ={
    pruebaFollow
}