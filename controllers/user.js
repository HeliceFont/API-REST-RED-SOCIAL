// importar dependencias y módulos
const User = require("../models/user")
const Follow = require('../models/follow'); // Asegúrate de especificar la ruta correcta a tu modelo Follow
const Publication = require('../models/publication')
const bcrypt = require("bcrypt")
const mongoosePagination = require("mongoose-pagination")
const fs = require("fs")
const path = require("path")

// importar servicios
const jwt = require("../services/jwt")
const followService = require("../services/followService");
const { following } = require("./follow");
const validate = require ("../helpers/validate")

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/user.js",
        usuario: req.user
    })
}

// Registro de usuario
const register = (req, res) => {
    // Recoger datos de la petición
    let params = req.body

    // Comprobar que llegan los datos (+ validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        console.log("Validación incorrecta")
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        })
    }

    // Validación avanzada
    try{
        validate(params)
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "Validación no superada",
        })
    }
    

    // control de usuarios duplicados (consulta)
    User.find({
        // si el nick o usuario existen
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ]
        // then entonces
    }).then(async ( users) => {
        
        // si existe un usuario con el mismo nick o email
        if (users && users.length >= 0) {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe",
            });
        }

        // cifrar la contraseña 
        //en el hash el texto que vamos a cifrar que en este caso será la contraseña
        // el 10 significa que va a cifrar la contraseña 10 veces
        // pwd es la contraseña ya cifrada
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd


        // Crear el objeto de usuario a guardar despues de cifrar la contraseña
        let user_to_save = new User(params)

        // guardar usuario bd
        user_to_save.save().then((userSave) => {
            // Si no existe devolver error
            if (!userSave) {
                return res.status(404).send({
                    status: "error",
                    message: "No se ha guardado el usuario"
                });
            }
            if (userSave) {
                return res.status(200).send({
                    status: 'succes',
                    message: "Usuario Resgistrado con éxito"
                })
            }


        }).catch((error) => {
            // si llega un error
            if (error)
                return res.status(500).json({
                    status: "error",
                    message: "Error en la consulta de usuarios",
                });
        });
    })
}

const login = async (req, res) => {
    //Recoger los parametros
    let params = req.body

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    //Buscar en la bbdd si existe
    // este fragmento de código es una consulta a la base de datos 
    // que busca un usuario con un correo electrónico específico. 
    // Utiliza el modelo  User  y el método  findOne  para buscar un documento 
    // que coincida con el correo electrónico proporcionado en el parámetro params.email . 
    try {
        let user = await User.findOne({
            email: params.email
        })
        // .select({ "password": 0 }).exec();

        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario",
            });
        }

        //Comprobar su contraseña 
        let pwd = bcrypt.compareSync(params.password, user.password)
        if (!pwd) {
            return res.status(404).send({
                status: "Error",
                message: "Usuario o contraseña no válido"
            })
        }

        //Devolver Token
        const token = jwt.createToken(user)



        //Devolver datos de usaurio

        return res.status(200).send({
            status: "success",
            message: "Identificación exitosa!",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "No existe el usuario1",
        });
    }
}
const profile = async (req, res) => {
    // Recibir el parametro del id de usuario por la URL
    const id = req.params.id

    // Consulta para sacar los datos del usuario
    // seleccionamos password y role para no enviar dichos parametros y los quitamos dela petición
    const userProfile = await User.findById(id).select({ password: 0, role: 0 }).exec()
    if (!userProfile) {
        return res.status(404).send({
            status: "error",
            message: "El Usuario no Existe!"
        })
    }
    // Info de seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id)
    // Devolver el resultado
    return res.status(200).send({
        status: "success",
        user: userProfile,
        following: followInfo.following,
        follower: followInfo.followers
    })
}

const list = async (req, res) => {
    
    // Controlar en que página estamos
    let page = 1
    if (req.params.page) {
        // pasar a numero entero
        page = parseInt(req.params.page);
    }
    

    // Consulta con mongoose paginate
    const total = await User.countDocuments()
    // Calcular el índice de inicio para la paginación
    const itemsPerPage = 5
    const startIndex = (page - 1) * itemsPerPage
    //  Realizar la consulta con Mongo para obtener los usuarios de la página actual
    try {
        let userId = req.user.id

        const users = await User.find()
            .select("-password -email -role -__v")
            .sort('_id')
            .skip(startIndex)
            .limit(itemsPerPage)
            
        // Sacar Array de ids de los seguimientos
        let followUserIds = await followService.followUserIds(userId)
        
        // Devolver la respuesta
        return res.status(200).json({
            
            status: 'success',
            users,
            total,
            page,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
            
        })
        
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Error al obtener usuarios",
            error
        })
    }
    
    
    
}
const update = async (req, res) => {
    // Recoger info del usuario a actualizar
    let userIdentity = req.user
    let userToUpdate = req.body

    // Eliminar campos sobrantes
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    // delete userToUpdate.image

    // control de usuarios duplicados (consulta)
    User.find({
        // si el nick o usuario existen
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
        ]
        // then entonces
    }).exec().then(async (users) => {
        let userIsset = false


        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true
        });


        // si existe un usuario con el mismo nick o email
        if (userIsset == true) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        // cifrar la contraseña 
        //en el hash el texto que vamos a cifrar que en este caso será la contraseña
        // el 10 significa que va a cifrar la contraseña 10 veces
        // pwd es la contraseña ya cifrada
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd
        }else{
            userToUpdate.password = userIdentity.password
        }
        // Buscar y actualizar
        try {
            let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
            if (!userUpdate) {
                return res.status(400).json({
                    status: "error",
                    message: "Error al actualizar usuarios",
                });
            }
            // Devolver respuesta
            return res.status(200).json({
                status: 'success',
                message: 'metodo de actualizar usuario',
                User: userUpdate
            })
        } catch (error) {
            // Devolver respuesta
            return res.status(500).json({
                status: 'error',
                message: 'Error al actualizar',
            })
        }
    })
}
const upload = async (req, res) => {
    try {
        // Recoger el fichero de imagen y comprobar que existe
        if (!req.file) {
            return res.status(404).send({
                status: 'error',
                message: "No se ha subido ninguna imagen"
            })
        }
        let image = req.file.originalname
        // Sacar extension del archivo
        const imageSplit = image.split('.')
        const extension = imageSplit[1];
        try {
            // comprobar extension
            if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

                // Borrar archivo subido
                let filePath = req.file.path;
                let fileDeleted = fs.unlinkSync(filePath);
                return res.status(404).send({
                    status: 'error',
                    message: "Extensión de fichero no válida",
                    fileDeleted
                })
            } else (extension == "png" || extension == "jpg" || extension == "jpeg" || extension == "gif")
            // Guardar en BD
            let avatarUpload = await User.findByIdAndUpdate(
                { _id: req.user.id },
                { image: newImageName },
                { new: true }
            )
            return res.status(200).json({
                status: 'success',
                user: avatarUpload
            })


        } catch (error) {
            console.log(error)
            console.error("Extensión no válida", error)
        }


        // Conseguir el nombre del archivo 
        const user = await User.findById(req.user.id)
        const currentImage = user.image
        // Eliminar físicamente el archivo actual si existe
        try {
            if (currentImage) {
                /*La función  normalize  en este fragmento de código se utiliza para
                convertir la ruta de la imagen actual a una ruta normalizada. 
                Esto significa que la ruta se convertirá a una forma que sea más fácil de leer y entender.*/
                const normalizedCurrentImage = path.normalize(currentImage)
                /*La función  join  en este fragmento de código se utiliza para unir varias cadenas de texto en una sola cadena.
                En este caso, la función  join  se utiliza para unir la ruta del directorio actual ( __dirname ),
                la ruta de la carpeta de subida de avatares ( ../uploads/avatars ) y la ruta de la imagen normalizada ( normalizedCurrentImage ). 
                La variable  __dirname  en este fragmento de código representa la ruta del directorio actual. 
                Esta variable se utiliza para garantizar que la ruta completa a la imagen sea correcta, 
                incluso si el directorio actual cambia.
                */
                const currentImagePath = path.join(__dirname, '../uploads/avatars', normalizedCurrentImage)
                // Eliminar si no cumple las extensiones
                fs.unlink(currentImagePath, (err) => {
                    err,
                        console.error("Extension del archivo no disponible para éste campo")
                })
            }
        } catch (error) {
            console.error("Error al intentar eliminar el archivo anterior", error)
        }

        // Conseguir el nombre del archivo subido
        const newImageName = req.file.filename

        //  Actualizar el Avatar en la base de datos y guardarlo.
        const userUpdate = await User.findByIdAndUpdate(
            { _id: req.user.id },
            { image: newImageName },
            { new: true }
        )

        if (!userUpdate) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida"
            })
        }
        // Devolver respuesta
        return res.status(200).json({
            status: "success",
            user: userUpdate,
            file: req.file
        })

    } catch (error) {
        console.error("Error en la subida del avatar", error)
        return res.status(500).send({
            status: "error",
            message: "Error en la subida del avatar1"
        })
    }
}
const avatar = async (req, res) => {
    // Sacar el parámetro de la url
    const file = req.params.file

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;
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
const counters = async (req, res) => {
    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const following = await Follow.countDocuments({ "user": userId });
        const followed = await Follow.countDocuments({ "followed": userId });
        const publications = await Publication.countDocuments({ "user": userId });

        return res.status(200).send({
            userId,
            following,
            followed,
            publications
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: "Error",
            message: "Error al enviar el controlador counters",
            error: error.message // Agrega el mensaje de error al objeto de respuesta
        });
    }
};



// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}