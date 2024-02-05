// Importar Módulos
const fs = require("fs")
const path = require("path")
// Importar modelos
const Publication = require("../models/publication")

// Importar servicios
const followService = require("../services/followService")


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
            .sort("-created_at") // Ordenar por fecha de creación descendente
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .populate("user", '-password -__v -role -email')
            .exec();

        if (!publications) {
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
// subir ficheros
const upload = async (req, res) => {
    try {
        const publicationId = req.params.id;

        if (!req.file) {
            return res.status(404).send({
                status: 'error',
                message: "No se ha subido ninguna imagen"
            });
        }

        const image = req.file.originalname;
        const imageSplit = image.split('.');
        const extension = imageSplit[1].toLowerCase(); // Convertir a minúsculas para comparación sin distinción de mayúsculas

        // Comprobar extensión
        if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif" && extension !== "mp4") {
            // Borrar archivo subido
            let filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(404).send({
                status: 'error',
                message: "Extensión de archivo no válida",
            });
        }

        // Conseguir el nombre del archivo subido
        const newImageName = req.file.filename;

        // Actualizar el Avatar en la base de datos y guardarlo
        const publicationUpdated = await Publication.findByIdAndUpdate(
            publicationId,
            { file: newImageName },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida"
            });
        }

        // Devolver respuesta
        return res.status(200).json({
            status: "success",
            publication: publicationUpdated,
            file: req.file
        });

    } catch (error) {
        console.error("Error en la subida del avatar", error);
        return res.status(500).send({
            status: "error",
            message: "Error en la subida del archivo de la publicación"
        });
    }
};

// Devolver archivos multimedia
const media = async (req, res) => {
    // Sacar el parámetro de la url
    const file = req.params.file

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;
    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: 'La imagen no existe'
            })
        }

        // Devolver un file
        // sendFile metodo de Express// Path.resolve importamos arriba librería path
        return res.sendFile(path.resolve(filePath))
    })
}
// Listar publicaciones de un usuario (FEED)
const feed = async (req, res) => {
    // Sacar el id de un usuario
    const userId = req.params.id;
    // Sacar la página actual
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    // Establecer Número de elementos por página
    let itemsPerPage = 5;
    // Sacar un Array de ids de usuario que yo sigo como usuario identificado
    try {
        const myFollows = await followService.followUserIds(req.user.id);

        // Obtener el número total de publicaciones
        const totalPublications = await Publication.countDocuments({
            user: { $in: myFollows.following }
        });

        // Calcular el total de páginas
        const totalPages = Math.ceil(totalPublications / itemsPerPage);

        // Find a publicaciones operador $in, ordenar, popolar, paginar
        const publications = await Publication.find({
            user: { $in: myFollows.following }
        })
            .populate('user text file', '-password -__v -role -email')
            .sort("-created_at") // Ordenar por fecha de creación descendente
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        if (publications.length === 0) {
            return res.status(200).send({
                status: "success",
                message: 'No hay publicaciones de tus seguidores',
                totalPages,
                totalPublications,
                following: myFollows.following,
                publications,
                
            });
        }

        return res.status(200).send({
            status: "success",
            message: 'Feed de publicaciones',
            totalPages,
            totalPublications,
            following: myFollows.following,
            publications,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "error",
            message: 'No se han listado las publicaciones del feed',
            error: error.message
        });
    }
};







// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}