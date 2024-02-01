// Importar Modelo
const follow = require("../models/follow")
const User = require("../models/user")

// importar mongoose paginate
const mongoosePaginate = require("mongoose-pagination")



// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/follow.js"
    })
}

// Acción de guardar un follow (acción de seguir)
const save = async (req, res) => {
    // conseguir datos que llegan por el body
    const params = req.body

    //sacar id del usuario identificado 
    const identity = req.user

    // Crear objeto con modelo follow
    let userToFollow = new follow({
        user: identity.id,
        followed: params.followed
    })
    // Guardar objeto en Base de datos // followStored guardado
    userToFollow.save().then((followStored) => {

        if (!userToFollow) {
            return res.status(404).send({
                status: "error",
                message: "No se ha podido seguir al usuario"
            })
        }
        if (userToFollow) {
            return res.status(200).send({
                status: "succes",
                identity: req.user,
                follow: followStored,
                message: "Se ha guardado el usuario",

            })
        }
    })
}

// Accion de borrar un follow / dejar de seguir
const unfollow = async (req, res) => {
    try {
        //Who am i
        const logged_user_id = req.user.id;
        //Who i want to stop following
        const followed_user = await User.findById(req.params.id).exec();
        //Save in bbdd
        let follow_relation = await follow.findOneAndDelete({
            user: logged_user_id,
            followed: followed_user._id,
        });

        if (!follow_relation)
            throw {
                statusCode: 500,
                message: "Couldn't find this following relation",
            };

        return res.status(200).send({
            status: "Success",
            message: `Succesfully unfollowed ${followed_user.nick}`,
        });
    } catch (error) {
        return res.status(error || "500").send({
            status: "Error",
            message: error.message || "There was an error while unfollowing the user",
        });
    }
};
// Accion de listado de uruarios que cualquier usuario está siguiendo
const following = async (req, res) => {

    try {
        // Sacar el id del usuario identificado
        let userId = req.params.id
        // Comprobar si el id del usuario por parametro en url
        const total = await follow.countDocuments({ user: userId })
        // Comprobar si me llega la página, sino la página 1 
        let page = 1

        if (req.params.page) page = req.params.page

        // Usuarios por página quiero mostrar(Para hacer esto importar mongoose)
        const itemPerPage = 5

        // find a follow, popular datos de los usuario y paginar con mongoose paginate
        // usamos populate para quitar los id de sus campos "user followed" y mostrar el stringo de lo campos y quitar password role y __v
        follow.find({ user: userId })
        .populate("user followed", "-password -role -__v")
        .paginate(page, itemPerPage, )
        .then((follows,) => {
            // Listado de usuarios que hay en común con 2 usuarios
            // Sacar Array de ids de los amigos en común
            return res.status(200).send({
                status: "succes",
                message: "Listado de usuarios que me siguen",
                follows,
                total
            })
        })
    } catch (error) {
        return res.status(error || "500").send({
            status: "Error",
            message: error.message || "No se encontro datos en el listado followers",
        });

    }
}

// Acción Listado de usuarios que siguen a cualquier otro usuario
const followers = async (req, res) => {
            return res.status(200).send({
                status: "succes",
                message: "Listado de usuarios que me siguen",
            })
        
}

// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}