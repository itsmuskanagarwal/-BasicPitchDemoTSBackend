// const http = require("http");
// const fs = require("fs");
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const express = require('express');
// const multer = require('multer');

// const BasicPitch = require("@spotify/basic-pitch")
// const { AudioBuffer, AudioContext } = require("web-audio-api");

// const app = express();
// const port = 3000;

// app.use(cors());

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/')
//     },
//     filename: (req, file, cb) => {
//       cb(null, file.originalname);
//     }
//   });

// const upload = multer({ storage: storage });

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.post('/convertAudio', upload.single('audioFile'), async (req, res) => {

//     console.log(req.file);
//     console.log("'Audio file received!'")

//     const audioCtx = new AudioContext();
//     let audioBuffer = undefined;

//     audioCtx.decodeAudioData(
//         fs.readFileSync(req.file.path),
//         async (_audioBuffer: AudioBuffer) => {
//           audioBuffer = _audioBuffer;
//         },
//         () => {}
//       );      

//       while (audioBuffer === undefined) {
//         await new Promise(r => setTimeout(r, 1));
//       }

//       const frames = [];
//       const onsets = [];
//       const contours = [];
//       let pct = 0;
//       const model = "https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json";
//       const basicPitch = new BasicPitch.BasicPitch(model);
//       await basicPitch.evaluateModel(
//         audioBuffer,
//         (f, o, c) => {
//           frames.push(...f);
//           onsets.push(...o);
//           contours.push(...c);
//         },
//         (p) => {
//           pct = p;
//         }
//       );

//       const notes = BasicPitch.noteFramesToTime(
//         BasicPitch.addPitchBendsToNoteEvents(
//           contours,
//           BasicPitch.outputToNotesPoly(frames, onsets, 0.25, 0.25, 5)
//         )
//       );
//     //   return notes;
//     res.json({notes : notes, message: 'Audio file received!' });
//   });

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });


import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';

import { BasicPitch } from '@spotify/basic-pitch/src/inference';
import { AudioBuffer, AudioContext } from 'web-audio-api'
import {
  addPitchBendsToNoteEvents,
  NoteEventTime,
  noteFramesToTime,
  outputToNotesPoly,
} from "@spotify/basic-pitch/src/toMidi";

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/convertAudio', upload.single('audioFile'), async (req, res) => {
  console.log(req.file);
  console.log("'Audio file received!'");

  const audioCtx = new AudioContext();
  let audioBuffer;

  audioCtx.decodeAudioData(
    fs.readFileSync(req.file!.path),
    async (_audioBuffer : AudioBuffer) => {
      audioBuffer = _audioBuffer;
    },
    () => {},
  );

  while (audioBuffer === undefined) {
    await new Promise((r) => setTimeout(r, 1));
  }

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];
  let pct: number = 0;
  const model =
    'node_modules/@spotify/basic-pitch/model/model.json';

  const basicPitch = new BasicPitch(model);
  await basicPitch.evaluateModel(
    audioBuffer ,
    (f: number[][], o: number[][], c: number[][]) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    (p: number) => {
      pct = p;
    }
  );

  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.25, 0.25, 5),
    ),
  );

  res.json({ message: 'Audio file received!' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
