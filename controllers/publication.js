const Publication = require("../models/publication")

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/publication.js"
    })
}
// Acción Guardar Publicacion
const save = async (req, res) => {
    try {
        // Recoger datos del body
        const params = req.body

        // Si no me llegan dar respuesta negativa
        if (!params.text) return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publicación" })

        // Crear y rellenar los datos del modelo
        let newPublication = await new Publication(params)
        newPublication.user = req.user.id

        //  Guardar objeto en la base de datos
        newPublication.save().then((publicationStored) => {
            if (!publicationStored) return res.status(400).send({ status: "error", message: "No se ha guardado la publicación" })
            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Publicación Guardada",
                publicationStored
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 'Error',
            message: 'Ha habido un error'
        })
    }
}
// Sacar una publicación
const detail = async (req, res) => {
    // sacarid de publicación de la url
    const publicationId = req.params.id

    // Find con la condicion del id
    Publication.findById(publicationId).then((publicationStored) => {
        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicación"
            })
        }
        // Devolver Respuesta
        return res.status(200).send({
            status: "success",
            message: "Mostrar publicación",
            publication: publicationStored
        })
    })
}
// Eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar id de la publicación a eliminar
        const publicationId = req.params.id
        // Find y Luego un Remove
        const  publicationRemoved = await Publication.findByIdAndRemove(publicationId)
        Publication.find({ "user": req.user.id, "_id": publicationId }).remove(error => {
            if (!publicationRemoved) {
                // Devolver Respuesta
                return res.status(500).send({
                    status: "error",
                    message: "error al Borrar publicación",
                })
            }
            console.log(publicationRemoved)
            // Devolver Respuesta
            return res.status(200).send({
                status: "success",
                message: "Se ha Borrado tu publicación",
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 'Error',
            message: 'Ha habido un error'
        })
    }
}
// Listar todas las publicaciones

// Listar publicaciones de un usuario

// subir ficheros

// Devolver archivos multimedia



// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
}