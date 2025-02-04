const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Login-SignUp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
