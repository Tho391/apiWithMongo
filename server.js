//call the packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./app/models/user');
var port = process.env.PORT || 8080;

//connect local db
//mongoose.connect('mongodb://localhost:27017/day05');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost:27017/day05');

//app config
//use body parser so we can grab  information from post request
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//config our app to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
//log all requests to the console
app.use(morgan('dev'));
//route for out api

//basic route for the home page
app.get('/', function (req, res) {
    res.send('Welcome to the homepage');
});
//middleware to use for all requests
var apiRouter = express.Router();
apiRouter.use(function (req, res, next) {
    //do API router
    console.log('Bao hieu API router co nguoi vao trang MAIN!');
    //we add more code here with authentication later
    next();
});

//test route to make sure every thing is working
//accesses at GET http://localhost:8080/api
apiRouter.get('/', function (req, res) {
    res.json({
        message: 'Vi du dau tien ve API'
    });

})

app.use('/api', apiRouter);

//on routes that end in /routers
apiRouter.route('/users')
    .post(function (req, res) {
        //create a new instace of the user model
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        //save the user and check for errors
        user.save(function (err) {
            if (err) {
                //duplicate entry
                if (err.code == 11000)
                    return res.json({
                        success: false,
                        message: 'A user with that username already exists. '
                    });
                else
                    return res.send(err);
            }
            res.json({
                message: 'User created'
            });
        })
    })
    //get all the users (acessed at Get http://localhost:8080/api/users)
    .get(function (req, res) {
        User.find(function (err, users) {
            if (err) return res.send(err);

            //return the users
            res.json(users);
        });
    });

apiRouter.route('/users/:user_id')
    //get the user with that id
    .get(function (req, res) {
        User.findById(req.params.user_id, function (err, user) {
            if (err) return res.send(err);
            //return that user
            res.json(user);
        });
    })
    //update the user with this id
    .put(function (req, res) {
        User.findById(req.params.user_id, function (err, user) {
            if (err) return res.send(err);
            //set the user info if it exists in the request
            if (req.body.name) user.name = req.body.name;
            if (req.body.username) user.username = req.body.username;
            if (req.body.password) user.password = req.body.password;

            //save the user
            user.save(function (err) {
                if (err) return res.send(err);

                //return a message
                res.json({
                    message: 'User updated!'
                });
            });
        });
    })
    .delete(function (req, res) {
        User.remove({
            _id: req.params.user_id
        }, function (err, user) {
            if (err) return res.send(err);

            res.json({
                message: 'Successfully deleted'
            });
        });
    });


//start the server

app.listen(port);
console.log('Port can dung la: ' + port);