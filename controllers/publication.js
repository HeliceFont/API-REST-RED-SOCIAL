const publication = require("../models/publication")
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
        const publicationId = req.params.id;

        // Verificar si la publicación pertenece al usuario antes de eliminarla
        const publication = await Publication.findOneAndDelete({ "user": req.user.id, "_id": publicationId });

        if (!publication) {
            // Si no se encontró la publicación para eliminar
            return res.status(404).json({
                status: "error",
                message: "No se encontró la publicación para eliminar",
            });
        }

        // Devolver Respuesta
        return res.status(200).json({
            status: "success",
            message: "Se ha borrado tu publicación",
            publication: publication,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Ha habido un error al intentar borrar la publicación',
        });
    }
};

// Listar todas las publicaciones
const user = async (req, res) => {
    try {
        // Sacar el id de un usuario
        const userId = req.params.id;

        // Obtener el total de publicaciones
        const total = await Publication.countDocuments({ user: userId });

        // Controlar la página
        let page = 1;

        if (req.params.page) {
            page = parseInt(req.params.page, 10); // Validar que sea un número entero
        }

        const itemsPerPage = 5;

        // Calcular el número total de páginas
        const totalPages = Math.ceil(total / itemsPerPage);

        // Utilizar async/await y la función de Mongoose para paginar
        const publications = await Publication.find({ "user": userId })
            .sort( "-created_at" ) // Ordenar por fecha de creación descendente
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .populate("user", '-password -__v -role -email')
            .exec();

            if(!publications){
                return res.status(404).send({
                    status: "error",
                    message: "No hay publicaciones que mostrar"
                })
            }

        // Devolver Respuesta
        return res.status(200).json({
            status: "success",
            message: "Publicaciones de un usuario",
            page,
            totalPages,
            total,
            publications,
            
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Ha habido un error al intentar listar las publicaciones',
        });
    }
};


// Listar publicaciones de un usuario (FEED)

// subir ficheros

// Devolver archivos multimedia



// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user
}