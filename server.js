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

    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: voiceType || 'en-US-Standard-I',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    // 🛠 Decode base64 audio
    const audioBuffer = Buffer.from(response.audioContent, 'base64');

    // 🛑 Log raw audioContent snippet for debugging
    console.log('Raw audioContent (first 100 chars):', response.audioContent.slice(0, 100));

    if (!response.audioContent || response.audioContent.length < 50) {
      console.error('🛑 Invalid or empty audioContent:', response.audioContent);
    }

    // ✅ Send the audio file properly
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="output.mp3"',
    });
    res.send(audioBuffer);
  } catch (err) {
    console.error('Error in /speak:', err);
    res.status(500).send('TTS error');
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 TTS server running at http://localhost:${port}`);
});