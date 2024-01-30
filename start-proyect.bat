@REM ejecutar demonio de mongo
start cmd.exe /k "cd C:\Program Files\MongoDB\Server\6.0\bin && mongod.exe --dbpath C:\data\db"
@REM ejecutar la base de datos
start cmd.exe /k "cd C:\Users\Usuario\Desktop\react\API-REST-RED-SOCIAL && npm start"