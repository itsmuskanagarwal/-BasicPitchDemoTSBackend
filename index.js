const http = require("http");
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const multer = require('multer');

const BasicPitch = require("@spotify/basic-pitch")
const { AudioBuffer, AudioContext } = require("web-audio-api");

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/convertAudio', upload.single('audioFile'), async (req, res) => {

    console.log(req.file);
    console.log("'Audio file received!'")

    const audioCtx = new AudioContext();
    let audioBuffer = undefined;

    try {
        audioBuffer = await audioCtx.decodeAudioData(fs.readFileSync(req.file.path));
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error decoding audio file' });
        return;
      }

      ab = () => ({ audioBuffer: undefined });

      while (ab === undefined || ab.audioBuffer === undefined) {
        console.log("waiting for audio to load");
        await new Promise((r) => setTimeout(r, 10));
      }

      const frames = [];
      const onsets = [];
      const contours = [];
      let pct = 0;
      const model = "https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json";
      const basicPitch = new BasicPitch.BasicPitch(model);
      await basicPitch.evaluateModel(
        ab.audioBuffer,
        (f, o, c) => {
          frames.push(...f);
          onsets.push(...o);
          contours.push(...c);
        },
        (p) => {
          pct = p;
        }
      );

      const notes = BasicPitch.noteFramesToTime(
        BasicPitch.addPitchBendsToNoteEvents(
          contours,
          BasicPitch.outputToNotesPoly(frames, onsets, 0.25, 0.25, 5)
        )
      );
    //   return notes;
    res.json({notes : notes, message: 'Audio file received!' });
  });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


