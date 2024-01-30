// Importar dependencias
const jwt = require("jwt-simple")
const moment = require("moment")
// Clave secreta
const secretKey = "mySecretKey_ClaVE_SecRETA_del_proyecto_DE_lA_RED_soCIAL_689689";

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


