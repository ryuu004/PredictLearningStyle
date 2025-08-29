const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios

const app = express();
const port = 3000; // Node.js backend will run on port 3000
const pythonMicroserviceUrl = 'http://localhost:5000/predict'; // URL of your Python microservice

app.use(cors());
app.use(express.json()); // For parsing application/json

app.get('/', (req, res) => {
    res.send('Node.js backend is running!');
});

// This will be the endpoint that the frontend calls
// It will then forward the request to the Python microservice
app.post('/predict', async (req, res) => {
    try {
        const pythonResponse = await axios.post(pythonMicroserviceUrl, req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling Python microservice:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ error: 'No response from Python microservice. Is it running?' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Error setting up request to Python microservice.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Node.js backend listening at http://localhost:${port}`);
});