document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const recommendationDiv = document.getElementById('recommendation');
    const serviceRecommendation = document.getElementById('serviceRecommendation');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const interest = document.getElementById('interest').value;
        const skillLevel = document.querySelector('input[name="skillLevel"]:checked').value;
        const goal = document.getElementById('goal').value;

        let recommendation = '';

        
        if (interest === 'programming' && skillLevel === 'beginner' && goal === 'career') {
            recommendation = 'Start with our "Introduction to Programming" course.';
        } else if (interest === 'design' && skillLevel === 'intermediate' && goal === 'upskill') {
            recommendation = 'Check out our "Advanced UI/UX Design" workshop.';
        } else if (interest === 'marketing' && skillLevel === 'advanced' && goal === 'personal') {
            recommendation = 'Consider our "Digital Marketing Strategy" seminar.';
        } else {
            recommendation = 'Based on your responses, we recommend exploring our general catalog.';
        }

        serviceRecommendation.textContent = recommendation;
        recommendationDiv.style.display = 'block';
    });
});

function openSurveyPopup() {
    document.getElementById('surveyPopup').style.display = 'block';
}

function closeSurveyPopup() {
    document.getElementById('surveyPopup').style.display = 'none';
}

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3001; // Choose a different port than your frontend (e.g., 3001)

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Use body-parser to parse JSON bodies

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'UserFlowAIDB'
};

// Function to get course recommendations from the database
async function getCourseRecommendations(interest, skillLevel, goal) {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Construct the SQL query based on the provided parameters
        let sql = `
            SELECT CourseName, Description
            FROM Courses
            WHERE 1=1  -- Start with a condition that is always true
        `;

        const values = [];

        if (interest) {
            sql += ` AND Description LIKE ?`;
            values.push(`%${interest}%`); // Example:  Match courses with the interest in the description
        }
        if (skillLevel) {
            sql += ` AND DifficultyLevel = ?`;
            values.push(skillLevel);
        }
         // Add more conditions based on your database schema and requirements
        console.log("SQL Query:", sql); // Log the SQL query for debugging
        console.log("Values:", values); // Log the values for debugging

        const [rows] = await connection.execute(sql, values);
        return rows;
    } catch (error) {
        console.error('Error fetching course recommendations:', error);
        return []; // Return an empty array in case of an error
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// API endpoint to handle survey submissions and return course recommendations
app.post('/api/recommendations', async (req, res) => {
    const { interest, skillLevel, goal } = req.body;

    console.log('Received request with data:', { interest, skillLevel, goal }); // Log the received data

    try {
        const recommendations = await getCourseRecommendations(interest, skillLevel, goal);
        console.log('Recommendations from database:', recommendations); // Log the recommendations

        if (recommendations.length > 0) {
            res.json(recommendations); // Send the recommendations as JSON
        } else {
            res.status(404).send('No matching courses found.');
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});

