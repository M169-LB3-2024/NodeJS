const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const app = express();
const port = 3000;

// MySQL configuration
const dbConfig = {
    host: 'db',
    user: 'root',
    password: 'password',
    database: 'testdb',
    port: 3306
};

const pool = mysql.createPool(dbConfig);

// Auth0 configuration
const auth0Strategy = new Auth0Strategy({
    domain: 'YOUR_AUTH0_DOMAIN',
    clientID: 'YOUR_AUTH0_CLIENT_ID',
    clientSecret: 'YOUR_AUTH0_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/callback'
}, function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
});

passport.use(auth0Strategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Session configuration
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Login route
app.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), (req, res) => {
    res.redirect('/');
});

// Callback route from Auth0
app.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/users');
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(() => {});
    res.redirect('/');
});

// Middleware to check if the user is authenticated
function secured(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Route to get all users from the "users" table (protected by Auth0)
app.get('/users', secured, (req, res) => {
    const query = 'SELECT * FROM users';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
        } else if (results.length === 0) {
            res.send('Connection successful, but no users found in the database.');
        } else {
            let tableRows = results.map(user => 
                `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td></tr>`
            ).join('');
            res.send(`
                <html>
                    <head><title>User List</title></head>
                    <body>
                        <h1>User List</h1>
                        <table><tr><th>ID</th><th>Name</th><th>Email</th></tr>${tableRows}</table>
                    </body>
                </html>
            `);
        }
    });
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
