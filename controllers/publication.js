// Acciones de prueba
const pruebaPublication =(req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/publication.js"
    })
}

// Exportar acciones
module.exports ={
    pruebaPublication
}