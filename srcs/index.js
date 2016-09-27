var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var express = require('express');
var User = require('./user_model.js');
var requestIp = require('request-ip');

// create express app
var app = express()

// create api router
var api = createApiRouter()

// mount api before csrf is appended to the app stack
app.use('/api', api)

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csrf({ cookie: true }));
app.use(requestIp.mw());

app.get('/csrfToken', function(req, res) {
  // pass the csrfToken to the view
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ _csrf: req.csrfToken() }));
});

app.post('/user/connect', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	res.setHeader('Content-Type', 'application/json');
	User.connect(username, password, function (err, user) {
		if (err)
		{
			return res.send(JSON.stringify({
				_csrf: req.csrfToken(),
				status: "error",
				message: err
			}));
		}
		req.session.user = user;
		return res.send(JSON.stringify({
			_csrf: req.csrfToken(),
			status: "success",
			data: user
		}));
	});
});

app.post('/user/logout', function(req, res) {
	req.session.user = null;
	return res.send(JSON.stringify({
		_csrf: req.csrfToken(),
		status: "success",
	}));
});

app.post('/user/create', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var ip = req.clientIp;
	User.create(username, password, ip, function (err, user) {
		if (err)
		{
			return res.send(JSON.stringify({
				_csrf: req.csrfToken(),
				status: "error",
				message: err
			}));
		}
		return res.send(JSON.stringify({
			_csrf: req.csrfToken(),
			status: "success",
			data: user
		}));
	});
});


app.get('/user/find', function (req, res) {
	User.find(function (err, users) {
		if (err)
		{
			return res.send(JSON.stringify({
				_csrf: req.csrfToken(),
				status: "error",
				message: err
			}));
		}
		return res.send(JSON.stringify({
			_csrf: req.csrfToken(),
			status: "success",
			data: users
		}));
	});
});

function createApiRouter() {
  var router = new express.Router()

  router.post('/getProfile', function(req, res) {
    res.send('no csrf to get here')
  })

  return router
}

app.listen(3031);
console.log("API started.");