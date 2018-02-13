mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Flamewar')

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('entered database');
});

module.exports = mongoose;
