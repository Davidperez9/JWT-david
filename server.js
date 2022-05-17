const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
var db = require("./database.js")
var https = require('https');
var fs = require('fs');
var app = express();
const PUERTO = 9000;
const jwt = require('jsonwebtoken');
const secret = require('crypto').randomBytes(64).toString('hex')
const dotenv = require('dotenv');
const crypto = require('crypto');
const authTokens = {};

// get config vars
dotenv.config();
app.set('view engine', 'ejs');
// access config var
process.env.TOKEN_SECRET;


https.createServer({
   cert: fs.readFileSync('david.crt'),
   key: fs.readFileSync('david.key')
 },app).listen(PUERTO, function(){
	console.log('Servidor https correindo en el puerto 443');
});

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}


app.get('/', function(req, response){
	response.sendFile(path.join(__dirname + '/login.html'));
});


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));



app.post('/auth', function(request, response) {
	
	let username = request.body.username;
	let password = request.body.password;
        let email = request.body.email;
    
if (username && password) {
		db.all('SELECT * FROM user WHERE name = ? AND password = ?', [username, password], function(error, results, fields) {
			
if (error) throw error;
if (results.length > 0) {

const authToken = generateAuthToken();

	console.log(authToken)
	authTokens[authToken] = username;
        response.cookie('AuthToken', authToken);
	request.session.loggedin = true;
	request.session.username = username;
	
	response.redirect('/home');
} else {
	response.send('Incorrect Username and/or Password!');
	}			
			response.end();
		});
} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Bienvenido, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});


app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    db.all(sql, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get('/register', function(req, res, next){    
    // render to views/user/add.ejs
    res.render('register', {
        title: 'Registration Page',
        name: '',
        email: '',
        password: ''     
    })
    
})

app.post("/register", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password
    }
    
    
    var sql ="INSERT INTO user (name, email, password) VALUES (?,?,?)"
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
       res.render('login', {
            message: 'Registration Complete. Please login to continue.',
            messageClass: 'alert-success'
        });
    });
    
    }); 





app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password
    }
    
    
    var sql ="INSERT INTO user (name, email, password) VALUES (?,?,?)"
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
    
    }); 

app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where id = " + req.params.id
    db.get(sql, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
        }else{
            res.json({
                "message":"success",
                "data":row
            })
        }
      });
});





