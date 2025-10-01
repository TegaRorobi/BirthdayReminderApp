
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectToDatabase = require('./db_connect.js');
const birthdayGreetingController = require('./controllers/birthdayGreetingController.js');

const log = (level, message) => console.log(
  `[${new Date().toISOString()}] [SERVER] ${level?level:'INFO'}: ${message}`
);


const app = express();

app.use(express.json());
app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:11983',
      'https://tegarorobi-birthdayreminderapp.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.use(express.static('public/'));
app.post('/save-birthday', birthdayGreetingController.saveNewBirthday);
app.get('/send-birthday-greetings', birthdayGreetingController.sendBirthdayGreetings);

connectToDatabase();

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  log('INFO', `Server listening on port ${PORT} ...`);
  log('INFO', `http://localhost:${PORT}`)
})
