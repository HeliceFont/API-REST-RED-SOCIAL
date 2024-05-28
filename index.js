// Importar dependencias
const connection  = require ("./database/connection")
const express = require ("express")
const cors = require("cors")


// Mensaje de bienvenida
console.log("API node red social arrancada!! conexión a la base de datos correcta")

//conexión base de datos
connection()

// Crear servidor de Node
const app = express()
const puerto = 3900

//configurar cors
// middleware
app.use(cors())

//convertir los datos que lleguen en cada petición
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//cargar conf rutas
const UserRoutes = require("./routes/user")
const PublicationRoutes = require("./routes/publication")
const FollowRoutes = require("./routes/follow")

app.use("/api/user", UserRoutes)
app.use("/api/publication", PublicationRoutes)
app.use("/api/follow", FollowRoutes)


// ruta de prueba
app.get("/ruta-prueba", (req, res) =>{
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Luis Manuel",
            "web": "red social"
    
        }
    )
})

//Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("servidor de node corriendo en el puerto: ", puerto )
})