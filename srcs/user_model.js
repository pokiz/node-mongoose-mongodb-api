var mongoose = require('mongoose'),
	bcrypt = require("bcrypt"),
    SALT_WORK_FACTOR = 10;

var DB = {
	url: "mongodb://localhost",
	name: "test-api"
};

var collection = {
		name: "User",
		fields: {
			username: {type: String, required: true},
			password: {type: String, required: true},
			updated_at: { type: Date, default: Date.now },
			last_ip: String
		}
};

mongoose.connect(DB.url + "/" + DB.name);

var UserSchema = new mongoose.Schema(collection.fields);

UserSchema.pre('save', function (next) {
	var user = this;

	if (!user.isModified('password')) return next();
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);
		
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return next(err);
			user.password = hash;
			next();
		});
	});
});

var User = module.exports = mongoose.model(collection.name, UserSchema);

module.exports.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
	});
};


module.exports.create = function (username, password, last_ip, cb)
{
	if (typeof username != "string" || typeof password != "string" || typeof last_ip != "string")
		return;

	var user = new User({
		username: username,
		password: password,
		last_ip: last_ip
	});
	user.save(function(err){
  		if(err) {
		    console.log(err);
			cb(err);
		}
  		else
			cb(null, user);
	});
};

module.exports.connect = function(username, password, cb)
{
	User.findOne({ username: username }, function(err, user) {
	    if (err || !user) {
	    	if (err) console.log(err);
	    	return cb("Error fetching user.");
	    }
    	user.comparePassword(password, function(err, isMatch) {
		    if (err || !isMatch) {
	    		if (err) console.log(err);
	    		return cb("Wrong password.");
	    	}
	    	cb(null, user);
    	});
	});
};
