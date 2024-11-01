const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB configuration
const dbUri = 'mongodb://mongo:27017/testdb'; // Use the Docker Compose service name "mongo" for MongoDB

// Connect to MongoDB with Mongoose
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Define a User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', userSchema);

// Route to get all users from the "users" collection
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
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
                        <h1>Congratulations! 🎉</h1>
                        <p>You successfully connected to the MongoDB database!</p>
                        <p>No users found in the database, but everything is set up correctly.</p>
                    </body>
                </html>
            `);
        } else {
            // Display the users in an HTML table
            let tableRows = users.map(user => 
                `<tr><td>${user._id}</td><td>${user.name}</td><td>${user.email}</td></tr>`
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
                        <p>Here are the users currently in the database:</p>
                        <table>
                            <tr><th>ID</th><th>Name</th><th>Email</th></tr>
                            ${tableRows}
                        </table>
                    </body>
                </html>
            `);
        }
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
