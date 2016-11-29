var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	displayName: String,
	google: String,
	email: String,
	startDate: { type: Date, default: Date.now },
	endDate: Date,
  accessToken: String,
	moods: {
    type: Array
  }, 
	minimize: false 
});

module.exports = mongoose.model('User', userSchema);