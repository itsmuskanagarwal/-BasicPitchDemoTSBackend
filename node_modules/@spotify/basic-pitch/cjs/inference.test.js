"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs"));
const audio_loader_1 = __importDefault(require("audio-loader"));
const fs_1 = __importDefault(require("fs"));
const web_audio_api_1 = require("web-audio-api");
const inference_1 = require("./inference");
const toMidi_1 = require("./toMidi");
require('@tensorflow/tfjs-node');
require("./matchers");
const midi_1 = require("@tonejs/midi");
const matchers_1 = require("./matchers");
function writeDebugOutput(name, notes, noMelodiaNotes) {
    fs_1.default.writeFileSync(`${name}.json`, JSON.stringify(notes));
    fs_1.default.writeFileSync(`${name}.nomelodia.json`, JSON.stringify(noMelodiaNotes));
    const midi = new midi_1.Midi();
    const trackWithMelodia = midi.addTrack();
    trackWithMelodia.name = name;
    notes.forEach(note => {
        trackWithMelodia.addNote({
            midi: note.pitchMidi,
            duration: note.durationSeconds,
            time: note.startTimeSeconds,
            velocity: note.amplitude,
        });
        if (note.pitchBends) {
            note.pitchBends.forEach((b, i) => trackWithMelodia.addPitchBend({
                time: note.startTimeSeconds +
                    (note.durationSeconds * i) / note.pitchBends.length,
                value: b,
            }));
        }
    });
    const trackNoMelodia = midi.addTrack();
    trackNoMelodia.name = `${name}.nomelodia`;
    noMelodiaNotes.forEach(note => {
        trackNoMelodia.addNote({
            midi: note.pitchMidi,
            duration: note.durationSeconds,
            time: note.startTimeSeconds,
            velocity: note.amplitude,
        });
        if (note.pitchBends) {
            note.pitchBends.forEach((b, i) => trackWithMelodia.addPitchBend({
                time: note.startTimeSeconds +
                    (note.durationSeconds * i) / note.pitchBends.length,
                value: b,
            }));
        }
    });
    fs_1.default.writeFileSync(`${name}.mid`, midi.toArray());
}
expect.extend({
    toBeCloseToMidi(received, argument, atol = 1e-3, rtol = 1e-5) {
        for (let i = 0; i < received.length; ++i) {
            if (received[i].pitchBends !== undefined &&
                argument[i].pitchBends !== undefined) {
                const isClose = (0, matchers_1.toAllBeClose)(received[i].pitchBends, argument[i].pitchBends, 1e-3, 0);
                if (!isClose.pass) {
                    return isClose;
                }
            }
            if ((received[i].pitchBends === undefined &&
                argument[i].pitchBends !== undefined) ||
                (received[i].pitchBends !== undefined &&
                    argument[i].pitchBends === undefined)) {
                return {
                    pass: false,
                    message: () => `pitchbends for note ${i} do not match. ${JSON.stringify(received[i].pitchBends)} != ${JSON.stringify(argument[i].pitchBends)}`,
                };
            }
            if (received[i].pitchMidi !== argument[i].pitchMidi ||
                Math.abs(received[i].amplitude - argument[i].amplitude) >
                    atol + rtol * Math.abs(received[i].amplitude) ||
                Math.abs(received[i].durationSeconds - argument[i].durationSeconds) >
                    atol + rtol * Math.abs(received[i].durationSeconds) ||
                Math.abs(received[i].startTimeSeconds - argument[i].startTimeSeconds) >
                    atol + rtol * Math.abs(received[i].startTimeSeconds)) {
                return {
                    pass: false,
                    message: () => `Expected all midi elements in ${JSON.stringify(received.slice(Math.max(0, i - 5), Math.min(received.length - 1, i + 5)), null, '  ')} to be close to ${JSON.stringify(argument.slice(Math.max(0, i - 5), Math.min(argument.length - 1, i + 5)), null, '  ')} ` +
                        `(this is a slice of the data at the location + -5 elements). ` +
                        `${JSON.stringify(received[i], null, '  ')} != ${JSON.stringify(argument[i], null, '  ')} at index ${i}.`,
                };
            }
        }
        return {
            pass: true,
            message: () => ``,
        };
    },
});
test.each([
    [`file://${__dirname}/../model/model.json`],
    [tf.loadGraphModel(`file://${__dirname}/../model/model.json`)],
])('Can infer a C Major Scale', async (model) => {
    const wavBuffer = fs_1.default.readFileSync(`${__dirname}/../test_data/C_major.resampled.mp3`);
    const audioCtx = new web_audio_api_1.AudioContext();
    let audioBuffer = undefined;
    audioCtx.decodeAudioData(wavBuffer, async (_audioBuffer) => {
        audioBuffer = _audioBuffer;
    }, () => { });
    while (audioBuffer === undefined) {
        await new Promise(r => setTimeout(r, 1));
    }
    const frames = [];
    const onsets = [];
    const contours = [];
    let pct = 0;
    const basicPitch = new inference_1.BasicPitch(model);
    await basicPitch.evaluateModel(audioBuffer, (f, o, c) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
    }, (p) => {
        pct = p;
    });
    expect(pct).toEqual(1);
    const framesForArray = [];
    const onsetsForArray = [];
    const contoursForArray = [];
    pct = 0;
    await basicPitch.evaluateModel(audioBuffer.getChannelData(0), (f, o, c) => {
        framesForArray.push(...f);
        onsetsForArray.push(...o);
        contoursForArray.push(...c);
    }, (p) => {
        pct = p;
    });
    expect(pct).toEqual(1);
    expect(framesForArray).toEqual(frames);
    expect(onsetsForArray).toEqual(onsets);
    expect(contoursForArray).toEqual(contours);
    const poly = (0, toMidi_1.noteFramesToTime)((0, toMidi_1.addPitchBendsToNoteEvents)(contours, (0, toMidi_1.outputToNotesPoly)(frames, onsets, 0.25, 0.25, 5)));
    const polyNoMelodia = (0, toMidi_1.noteFramesToTime)((0, toMidi_1.addPitchBendsToNoteEvents)(contours, (0, toMidi_1.outputToNotesPoly)(frames, onsets, 0.5, 0.3, 5, true, null, null, false)));
    const polyNotes = require('../test_data/poly.json');
    const polyNoMelodiaNotes = require('../test_data/poly.nomelodia.json');
    expect(poly).toBeCloseToMidi(polyNotes, 1e-3, 0);
    expect(polyNoMelodia).toBeCloseToMidi(polyNoMelodiaNotes, 1e-3, 0);
});
test('Can correctly evaluate vocal 80 bpm data', async () => {
    const vocalDa80bpmData = require('../test_data/vocal-da-80bpm.json');
    const vocalDa80bpmDataNoMelodia = require('../test_data/vocal-da-80bpm.nomelodia.json');
    const wavBuffer = await (0, audio_loader_1.default)(`${__dirname}/../test_data/vocal-da-80bpm.22050.wav`);
    const frames = [];
    const onsets = [];
    const contours = [];
    let pct = 0;
    const basicPitch = new inference_1.BasicPitch(`file://${__dirname}/../model/model.json`);
    const wavData = Array.from(Array(wavBuffer.length).keys()).map(key => wavBuffer._data[key]);
    const audioBuffer = web_audio_api_1.AudioBuffer.fromArray([wavData], 22050);
    const [preparedDataTensor, audioOriginalLength] = await basicPitch.prepareData(audioBuffer.getChannelData(0));
    const audioWindowedWindows = vocalDa80bpmData.audio_windowed.length;
    const audioWindowedFrames = vocalDa80bpmData.audio_windowed[0].length;
    const audioWindowedChannels = vocalDa80bpmData.audio_windowed[0][0].length;
    expect(preparedDataTensor.shape).toEqual([
        audioWindowedWindows,
        audioWindowedFrames,
        audioWindowedChannels,
    ]);
    const preparedData = preparedDataTensor.arraySync();
    expect(preparedData.length).toStrictEqual(vocalDa80bpmData.audio_windowed.length);
    expect(audioOriginalLength).toStrictEqual(vocalDa80bpmData.audio_original_length);
    preparedData.forEach((window, i) => {
        expect(window.length).toStrictEqual(vocalDa80bpmData.audio_windowed[i].length);
        window.forEach((frame, j) => {
            expect(frame.length).toStrictEqual(vocalDa80bpmData.audio_windowed[i][j].length);
            frame.forEach((channel, k) => {
                expect(channel).toBeCloseTo(vocalDa80bpmData.audio_windowed[i][j][k], 4);
            });
        });
    });
    await basicPitch.evaluateModel(wavBuffer, (f, o, c) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
    }, (p) => {
        pct = p;
    });
    expect(pct).toEqual(1);
    expect(frames.length).toStrictEqual(vocalDa80bpmData.unwrapped_output.note.length);
    frames.forEach((frame, i) => {
        expect(frame).toAllBeClose(vocalDa80bpmData.unwrapped_output.note[i], 5e-3, 0);
    });
    expect(onsets.length).toStrictEqual(vocalDa80bpmData.unwrapped_output.onset.length);
    onsets.forEach((onset, i) => {
        expect(onset).toAllBeClose(vocalDa80bpmData.unwrapped_output.onset[i], 5e-3, 0);
    });
    expect(contours.length).toStrictEqual(vocalDa80bpmData.unwrapped_output.contour.length);
    contours.forEach((contour, i) => {
        expect(contour).toAllBeClose(vocalDa80bpmData.unwrapped_output.contour[i], 5e-3, 0);
    });
    const poly = (0, toMidi_1.noteFramesToTime)((0, toMidi_1.addPitchBendsToNoteEvents)(contours, (0, toMidi_1.outputToNotesPoly)(frames, onsets, vocalDa80bpmData.onset_thresh, vocalDa80bpmData.frame_thresh, vocalDa80bpmData.min_note_length)));
    const polyNoMelodia = (0, toMidi_1.noteFramesToTime)((0, toMidi_1.addPitchBendsToNoteEvents)(contours, (0, toMidi_1.outputToNotesPoly)(frames, onsets, vocalDa80bpmDataNoMelodia.onset_thresh, vocalDa80bpmDataNoMelodia.frame_thresh, vocalDa80bpmDataNoMelodia.min_note_length, true, null, null, false)));
    expect(polyNoMelodia).toBeCloseToMidi(vocalDa80bpmDataNoMelodia.estimated_notes.map(note => {
        return {
            startTimeSeconds: note[0],
            durationSeconds: note[1] - note[0],
            pitchMidi: note[2],
            amplitude: note[3],
            pitchBends: note[4],
        };
    }), 1e-2, 0);
    expect(poly).toBeCloseToMidi(vocalDa80bpmData.estimated_notes.map(note => {
        return {
            startTimeSeconds: note[0],
            durationSeconds: note[1] - note[0],
            pitchMidi: note[2],
            amplitude: note[3],
            pitchBends: note[4],
        };
    }), 1e-2, 0);
}, 100000);
//# sourceMappingURL=inference.test.js.map