const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

// Set path to your service account key file
process.env.GOOGLE_APPLICATION_CREDENTIALS = './service-account.json'; // Replace with your filename

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const client = new textToSpeech.TextToSpeechClient();

app.post('/speak', async (req, res) => {
  try {
    const { text, voiceType } = req.body;

    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: voiceType || 'en-US-Standard-I'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };

    const [response] = await client.synthesizeSpeech(request);
   res.set('Content-Type', 'audio/mpeg');
res.send(Buffer.from(response.audioContent, 'base64'));
  } catch (err) {
    console.error('Error in /speak:', err);
    res.status(500).send('TTS error');
  }
}); // ✅ This line was missing the closing brace above

app.listen(port, () => {
  console.log(`🚀 TTS server running at http://localhost:${port}`);
});