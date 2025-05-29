const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');

process.env.GOOGLE_APPLICATION_CREDENTIALS = './service-account.json';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const client = new textToSpeech.TextToSpeechClient();

app.post('/speak', async (req, res) => {
  try {
    const { text, voiceType } = req.body;

    if (!text) {
      throw new Error('No text provided in request body.');
    }

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

    if (!response.audioContent) {
      throw new Error('No audioContent received from TTS API.');
    }

    const audioBuffer = Buffer.from(response.audioContent, 'base64');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="output.mp3"'
    });
    res.send(audioBuffer);

  } catch (err) {
    console.error('Error in /speak:', err);
    res.status(500).send(`TTS error: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`🚀 TTS server running at http://localhost:${port}`);
});