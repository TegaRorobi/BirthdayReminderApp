const mongoose = require ('mongoose')
require("dotenv").config()

const log = (level, message) => console.log(`[${new Date().toISOString()}] [DB_CONNECT] ${level?level:'INFO'}: ${message}`);

function connectToDatabase() {

    mongoose.connect(process.env.MONGODB_URI)

    mongoose.connection.on('connected' , () => {
        log('INFO', 'Connected to Database Successfully.')
    })

     mongoose.connection.on('error' , () => {
        log('ERROR', 'Failed Connecting to Database.')
    })
    
}

module.exports = connectToDatabase;
