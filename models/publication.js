const { Schema, model } = require("mongoose")

const PublicationSchema =Schema ({
    user:{
        type: Schema.ObjectId,
        ref: "User",
        required:true
    },
    text:{
        type: String,
        required: true
    },
    file: String,
    created_at:{
        type: Date,
        default: Date.now
    }
})

module.exports = model("Publication", PublicationSchema, "publications")