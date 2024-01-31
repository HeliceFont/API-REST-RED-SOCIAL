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
const save = async (req, res) =>{
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
        userToFollow.save().then(( followStored) => {
            
            if (!userToFollow) {
                return res.status(404).send({
                    status: "error",
                    message: "No se ha podido seguir al usuario"
                })
            }
            if(userToFollow){
                return res.status(200).send({
                    status: "succes",
                    identity: req.user,
                    follow: followStored,
                    message: "Se ha guardado el usuario",
                    
                }) 
            }
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