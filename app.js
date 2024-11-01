const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// MySQL configuration
const dbConfig = {
    host: 'db',           // The Docker Compose service name for MySQL
    user: 'root',
    password: 'password',
    database: 'testdb',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,  // Max number of connections in the pool
    queueLimit: 0         // Unlimited queueing of connection requests
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Route to get all users from the "users" table
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
        } else if (results.length === 0) {
            // Display a success message if no users are found
            res.send(`
                <html>
                    <head>
                        <title>Success</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; color: #333; }
                            h1 { color: #4CAF50; }
                            p { font-size: 1.2em; color: #666; }
                        </style>
                    </head>
                    <body>
                        <h1>Gratuliere  🎉</h1>
                        <p>You successfully connected to the MySQL database!</p>
                        <p>Erstelle noch deine Person auf der Datenbank</p>
                    </body>
                </html>
            `);
        } else {
            // Display the users in an HTML table
            let tableRows = results.map(user => 
                `<tr><td>${user.id}</td><td>${user.surname}</td><td>${user.lastname}</td></tr>`
            ).join('');

            res.send(`
                <html>
                    <head>
                        <title>User List</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; color: #333; }
                            h1 { color: #4CAF50; }
                            table { margin: auto; border-collapse: collapse; width: 50%; }
                            th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
                            th { background-color: #f2f2f2; }
                        </style>
                    </head>
                    <body>
                        <h1>User List</h1>
                        <p>Das sind alle User in der DB:</p>
                        <table>
                            <tr><th>ID</th><th>Surname</th><th>Lastname</th></tr>
                            ${tableRows}
                        </table>
                        <h1>Gratuliere 🎉</h1>
                        <p>Deine API funktioniert!</p>
                    </body>
                </html>
            `);
        }
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
