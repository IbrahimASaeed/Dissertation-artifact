const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Define the path to your Excel file
const excelFilePath = './DemoUserData.xlsx';

async function addUserToExcel(userData) {
    const workbook = new ExcelJS.Workbook();
    let worksheet;
    try {
        // Try reading the existing workbook
        await workbook.xlsx.readFile(excelFilePath);
        worksheet = workbook.getWorksheet('Users');
        // If the worksheet doesn't exist, add it with proper columns
        if (!worksheet) {
            worksheet = workbook.addWorksheet('Users');
            worksheet.columns = [
                { header: 'UserID', key: 'userID', width: 10 },
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Password', key: 'password', width: 30 },
                { header: 'CreatedAt', key: 'createdAt', width: 25 },
            ];
        }
    } catch (error) {
        // If the workbook doesn't exist, create it and add a new worksheet
        worksheet = workbook.addWorksheet('Users');
        worksheet.columns = [
            { header: 'UserID', key: 'userID', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Password', key: 'password', width: 30 },
            { header: 'CreatedAt', key: 'createdAt', width: 25 },
        ];
    }

    // Calculate a new UserID based on row count (first row is header)
    const newId = worksheet.rowCount;
    const now = new Date().toISOString();

    worksheet.addRow({
        userID: newId,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        createdAt: now
    });

    await workbook.xlsx.writeFile(excelFilePath);
    console.log('Registration data saved.');
}

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await addUserToExcel({ name, email, password });
        res.send('Registration successful! Data saved to Excel.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving registration data.');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});