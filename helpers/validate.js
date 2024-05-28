const validator = require("validator")

const validate = (params) => {

    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: 25 }) &&
        validator.isAlpha(params.name, "es-ES")

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3, max: 35 }) &&
        validator.isAlpha(params.surname, "es-ES")

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 2, max: 25 })

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email)

    let password = !validator.isEmpty(params.password)
    validator.isLength(params.password, { min: 2, max: undefined })

    if (params.bio) {
        let bio = validator.isLength(params.bio, { min: undefined, max: 255 })
    
        if (!bio) {
            throw new Error("No se ha superado la validación")
        } else {
            console.log("validacion superada")
        }
    }

    

    if (!name || !surname || !nick || !email || !password) {
        throw new Error("No se ha superado la validación")
    } else {
        console.log("validacion superada")
    }
}

module.exports = validate
