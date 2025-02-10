const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Example route to update trust score
app.post('/update-trust-score', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  try {
    // Here, you would send the token to Google/Facebook or other services to validate
    // For now, we'll mock a response from the external service for demonstration purposes
    // Example with Google OAuth (you'll need to verify the token on your backend)

    const googleResponse = await axios.post(
      'https://oauth2.googleapis.com/tokeninfo',
      { id_token: token }
    );

    // Let's assume you get the following info from Google API
    const accountAge = googleResponse.data['exp'] - googleResponse.data['iat']; // difference between 'exp' and 'iat' represents account age in seconds

    // Example logic to calculate trust score based on account age (just a mock calculation)
    let trustScore = 'F';
    if (accountAge > 31536000) { // 1 year in seconds
      trustScore = 'A';
    } else if (accountAge > 18000000) { // 6 months in seconds
      trustScore = 'B';
    }

    // Send the trust score back to the app
    res.send({
      score: trustScore,
      grade: 'A-F', // can be calculated based on multiple linked accounts
    });
  } catch (error) {
    console.error('Error during token verification:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});

