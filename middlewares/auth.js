// Importar dependencias o módulos
const jwt = require("jwt-simple")
// para poder gestionar fechas
const moment = require("moment")

// importar clave secreta
const libjwt = require("../services/jwt")
const secretKey = libjwt.secretKey

// MIDDLEWARE de autenticación
exports.auth = (req, res, next) => {

    // Comprobar si me llega la cabecera de autenticación
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "No hay cabecera de autorización"
        })              
    }

    // Decodificar el Token
    // /['"]/ quitamos valores que sean comilla simple y comilla doble
    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '') 

    // Decodificar el token
    try{
        let payload = jwt.decode(token, secretKey)

        // Comprobar expiracion del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status: "error",
                message: "El token ha expirado",
            })
        }
        // Agregar datos de usuario o request
        req.user = payload

    }catch(error){
        return res.status(404).send({
            status: "error",
            message: "Token no valido",
            
        })
    }
    // pasar a ejecución de acción
    next()
}
