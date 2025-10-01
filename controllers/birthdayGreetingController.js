
const Birthday = require('../models/Birthday');
const nodemailer = require('nodemailer');

const log = (level, message) => console.log(
  `[${new Date().toISOString()}] [BIRTHDAY_GREETING_CONTROLLER] ${level?level:'INFO'}: ${message}`
);

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const saveNewBirthday = async (req, res) => {
  log('INFO', 'POST /save-birthday: Validating Birthday instance ...');
  try {
    const {username, email, date} = req.body;

    if (!username || !email || !date) {
      return res.status(400).json({message: 'Ensure to supply a username, email and date'});
    };
    
    let birthday = await Birthday.create({
      username,
      email,
      date
    });

    log('INFO', `Birthday for ${birthday.username} <${birthday.email}> successfully saved.`);
    return res.status(201).json({message: 'Birthday saved successfully.', data: birthday});

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A birthday with this email already exists.' });
    }
    console.log(err);
    return res.status(500).json({error: err.message}); 
  }
};

const sendBirthdayGreetings = async (req, res) => {
  log('INFO', 'GET /send-birthday-greetings: Initiating birthday check ...');
  try {


    const today = new Date();
    const currentYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const birthdays = await Birthday.aggregate([
        { $project: {
            username: 1,
            email: 1,
            lastGreetingSentAt: 1,
            birthMonth: { $month: "$date" }, 
            birthDay: { $dayOfMonth: "$date" }
        }},
        { $match: {
            birthMonth: todayMonth,
            birthDay: todayDay
        }}
    ]);

    if (birthdays.length === 0) {
      log('INFO', '');
      return res.status(200).json({ 'message': 'No birthdays today :)' });
    };

    const updates = [];
    let sentGreetingsCount = 0;
    let failedGreetingSends = 0;

    for (const birthday of birthdays) {
      if (birthday.lastGreetingSentAt?.getFullYear() === currentYear) {
        log('INFO', `Birthday greeting already sent to ${birthday.username} <${birthday.email}>. Skipping ...`);
        continue;
      };

      try {
        await transporter.sendMail({
          from: `"Work" <${process.env.EMAIL_USER}>`,
          to: birthday.email,
          subject: `Hello ${birthday.username}, Happy Birthday!!🥳🎉`,
          text: 'Wishing you a happy birthday from work. We cherish and value performance metrics.',
          html: '<p>Wishing you a happy birthday from work.<br>We cherish and value your performance metrics.</p>'
        });

        updates.push(Birthday.findByIdAndUpdate(
          birthday._id, 
          { $set: { lastGreetingSentAt: new Date() } }
        ));
        sentGreetingsCount++
        
      } catch (err) {
        console.error(err);
        log('ERROR', `Error sending greeting to <${birthday.email}>: ${err.message}`);
        failedGreetingSends++
      }
    };

    await Promise.all(updates);
    
    log('INFO', `Checks done. ${sentGreetingsCount} birthday greetings sent out.`)
    return res.status(200).json({
      'message': sentGreetingsCount > 0 ?
        `Successfully sent out ${sentGreetingsCount} birthday greetings.` :
        'Checks complete. 0 birthday greetings sent.',
      'failedGreetingSends': failedGreetingSends,
      'totalBirthdaysChecked': birthdays.length
    });


 } catch (err) {
    console.log(err);
    return res.status(500).json({error: err.message}); 
  }
};

module.exports = {
  saveNewBirthday,
  sendBirthdayGreetings
};
