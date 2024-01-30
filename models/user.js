const { Schema, model } = require ("mongoose")

const UserSchema = Schema({
    name: {
        type: String,
        required: true
        // requerido
    },
    surname: String,
    bio: String,
    nick:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default:"role_user"
        // tambien puede ser role_admin
    },
    image:{
        type: String,
        default: "default.png"
    },
    created_at:{
        type: Date,
        default: Date.now
        // Fecha actual
    }
})

module.exports = model("User", UserSchema, "users")