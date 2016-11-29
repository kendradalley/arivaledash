var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');
var config = require('./config');
var jwt = require('jwt-simple');
var logger = require('morgan');
var request = require('request');
var bcrypt = require('bcrypt');
var User = require('./server/models/user');
var Message = require('./server/models/message');
var defaultMessages = require('./util/data/messages.json');

/*
 |--------------------------------------------------------------------------
 | Database Connection and Setup
 |--------------------------------------------------------------------------
 */
mongoose.connect(config.MONGODB_URI || 'mongodb://localhost/moods');
mongoose.connection.on('error', function(err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

Message.find({}, function(err, messages) {
	if (messages.length == 0) {
		Message.create(defaultMessages);
	}
});

/*
 |--------------------------------------------------------------------------
 | App instance and configuration
 |--------------------------------------------------------------------------
 */
var app = express();
app.set('port', process.env.PORT || 3000);
// app.set('host', process.env.IP || 'localhost');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(requireSSL);
app.use(express.static(__dirname + '/client'));

/*
 |--------------------------------------------------------------------------
 | SSL middleware
 |--------------------------------------------------------------------------
 */
function requireSSL(req, res, next) {
	if (app.get('env') === 'production' && req.get('x-forwarded-proto') !== 'https') {
		res.redirect('https://' + req.hostname + req.url);
	} else {
		next();
	}
}

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
    console.log('payload:', payload);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}
/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 |  Auth Endpoints
 |--------------------------------------------------------------------------
 */
  app.get('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

  app.put('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});



app.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.HS_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token, user: user });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
          var user = new User();
          user.google = profile.sub;
          user.picture = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          // user.accessToken = 
          user.save(function(err) {
            var token = createJWT(user);
            res.send({ token: token, user: user });
          });
        });
      }
    });
  });
});

app.get('/api/messages', function(req, res) {
    var moodMessages = {
      happy: [],
      okay: [],
      unhappy: []
    };
    Message.find({}, function(err, messages) {
      messages.forEach(function(m) {
        moodMessages[m.get('type')].push(m.get('message'));
      });
      res.send(moodMessages);
    });
  });

  app.post('/api/messages', ensureAuthenticated, function(req, res) {
    var msg = new Message();
    msg.type = req.body.type;
    msg.message = req.body.message;

    msg.save(function(err) {
      if (err) {
        if (err.err.indexOf('duplicate key') > -1) {
          res.status(409).send();
        }
        res.status(500).send();
      }
      res.status(201).end();
    });
  });

  app.get('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.userId, function(err, user) {
      if (!user) {
        return res.status(404).send({
          message: 'User not found.'
        });
      }
      return res.send(user);
    })
  });

// Edit Profile Page
  app.put('/api/me', ensureAuthenticated, function(req, res) {
    User.findById(req.userId, function(err, user) {
      if (!user) {
        return res.status(404).send();
      }

      user.displayName = req.body.displayName;
      user.save(function(err) {
        res.status(200).end();
      });
    });
  });

// Update Mood Array
  app.put('/api/me/moods', ensureAuthenticated, function(req, res) {
    // console.log('before user find:', req.user);
    User.findById(req.user, function(err, user) {
      // console.log('mood before:' + req.user); //
      if (!user) {
        // console.log('mood after:' + req.userId);
        return res.send({message: 'you are hitting mood error'});
      }
      // console.log('user found:', user);
      console.log('req.body.mood:', req.body.moods);
      var new_mood = {
        mood: req.body.moods,
        created_date: moment().format('YYYY-MM-DD')
      };
      user.moods.push(new_mood);
      //user.moods[moment().format('YYYY-MM-DD')] = req.body.mood;
      // user.moods = req.body.moods;
      user.markModified('moods');
      console.log(user);
      user.save(function(err, user) {
        if(!err){
          res.json(user.moods);
        }
      });
    })
  });
/*
 |--------------------------------------------------------------------------
 | Start the server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
	console.log('Go to localhost:' + app.get('port'));
});
