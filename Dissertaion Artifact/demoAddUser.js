const ExcelJS = require('exceljs');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const filePath = './DemoUserData.xlsx';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'UserFlowAIDB'
};

async function addDemoUser(userData) {
    const workbook = new ExcelJS.Workbook();
    let worksheet;
    try {
        await workbook.xlsx.readFile(filePath);
        worksheet = workbook.getWorksheet('Users') || workbook.addWorksheet('Users');
    } catch (err) {
        
        worksheet = workbook.addWorksheet('Users');
        worksheet.columns = [
            { header: 'UserID', key: 'userID', width: 10 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Password', key: 'password', width: 30 },
            { header: 'CreatedAt', key: 'createdAt', width: 25 },
        ];
    }

  
    userData.userID = worksheet.lastRow ? worksheet.lastRow.getCell('userID').value + 1 : 1;
    userData.createdAt = new Date().toISOString();

    worksheet.addRow(userData);
    await workbook.xlsx.writeFile(filePath);
    console.log('Demo user data added.');
}

async function addUserToDatabase(userData) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const now = new Date().toISOString();
        const sql = `
            INSERT INTO Users (Username, Email, Password, CreatedAt)
            VALUES (?, ?, ?, ?)
        `;
        const values = [userData.name, userData.email, userData.password, now];

        const [result] = await connection.execute(sql, values);
        console.log('User added to database with ID:', result.insertId);
        return result.insertId; // Return the new user ID
    } catch (error) {
        console.error('Error adding user to database:', error);
        throw error; // Re-throw the error to be caught by the route handler
    } finally {
        if (connection) {
            await connection.end(); // Close the connection in the finally block
        }
    }
}

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password before storing it (important for security!)
        // In a real application, use bcrypt or similar
        const hashedPassword = password; // Replace with actual hashing

        const userId = await addUserToDatabase({ name, email, password: hashedPassword });
        res.send(`Registration successful! User added with ID: ${userId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving registration data.');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

addDemoUser({
    username: 'NewDemoUser',
    email: 'newdemo@example.com',
    password: 'hashedDemoPassV2'
});