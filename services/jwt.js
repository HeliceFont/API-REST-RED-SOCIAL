// Importar dependencias
const jwt = require("jwt-simple")
const moment = require("moment")
// Clave secreta
const secretKey = process.env.API_KEY;

// Crear una función para generar tokens 
const createToken = (user) =>{
    // Obtener la fecha actual
    const currentDate = moment().utc().format("YYYY-MM-DD HH:mm:ss");
    // Crear el payload del token
    const payload = {
        exp: moment().add(30, "days").unix(),
        iat: moment().unix(),
        currentDate: currentDate,
        id: user.id,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image
    };
    // Devolver jwt token codificado 
    // Codificar el token utilizando la clave secreta
    return token = jwt.encode(payload, secretKey);
    
}

module.exports = {
    secretKey,
    createToken
}


