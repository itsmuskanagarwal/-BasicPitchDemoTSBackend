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
Object.defineProperty(exports, "__esModule", { value: true });
require("./matchers");
const tf = __importStar(require("@tensorflow/tfjs-node"));
const midi_1 = require("@tonejs/midi");
const toMidi_1 = require("./toMidi");
test('hzToMidi understands what 440Hz is', () => {
    expect(toMidi_1.testables.hzToMidi(440)).toBe(69);
});
test('midiToHz understands what 69 is', () => {
    expect(toMidi_1.testables.midiToHz(69)).toBe(440);
});
test.each([
    [0, 0],
    [1, 0.0116],
    [2, 0.0232],
])('modelFrameToTime returns correct times', (input, expected) => {
    expect(toMidi_1.testables.modelFrameToTime(input)).toBeCloseTo(expected, 4);
});
test.each([
    [[], null],
    [[1, 2, -1], 1],
])('argMax handles to handle empty and nonempty inputs correctly', (input, expected) => {
    expect(toMidi_1.testables.argMax(input)).toBe(expected);
});
test('argMaxAxis1 returns the correct indices', () => {
    expect(toMidi_1.testables.argMaxAxis1([
        [10, 11, 12],
        [13, 14, 15],
    ])).toStrictEqual([2, 2]);
});
test('whereGreaterThanAxis1 should return all elements greater than threshold in', () => {
    const [X, Y] = toMidi_1.testables.whereGreaterThanAxis1([
        [1, 2],
        [3, 4],
    ], 1);
    expect(X).toEqual([0, 1, 1]);
    expect(Y).toEqual([1, 0, 1]);
});
test('meanStdDev should return a mean and standard deviation of (2, 2) for an N(2, 4) array', () => {
    const expectedMean = 2;
    const expectedStd = 2;
    const [mean, std] = toMidi_1.testables.meanStdDev(tf
        .randomNormal([1000, 1000], expectedMean, expectedStd, 'float32')
        .arraySync());
    expect(mean).toBeCloseTo(expectedMean);
    expect(std).toBeCloseTo(expectedStd);
});
test('Global max should successfully calculate global max', () => {
    const expectedMax = 100;
    expect(toMidi_1.testables.globalMax([
        [1, 2, 3, 4, expectedMax, 5, 6, 7, 8, 9, 10],
        [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ])).toEqual(expectedMax);
});
test('min3dForAxis0 should successfully calculate min', () => {
    const expectedMin = [
        [-5, 0],
        [25, -100],
    ];
    expect(toMidi_1.testables.min3dForAxis0([
        [
            [-5, 2],
            [25, -4],
        ],
        [
            [-1, 29],
            [50, -100],
        ],
        [
            [0, 0],
            [75, 0],
        ],
    ])).toEqual(expectedMin);
});
test('max3dForAxis0 should successfully calculate max', () => {
    const expectedMax = [
        [-5, 0],
        [25, -100],
    ];
    expect(toMidi_1.testables.max3dForAxis0([
        [
            [-5, -2],
            [25, -400],
        ],
        [
            [-6, -29],
            [-50, -100],
        ],
        [
            [-100, 0],
            [-75, -500],
        ],
    ])).toEqual(expectedMax);
});
test('argRelMax should successfully return maxima', () => {
    const expected = [
        [3, 0],
        [3, 1],
    ];
    expect(toMidi_1.testables.argRelMax([
        [0, 0],
        [0, 0],
        [0, 0],
        [2, 2],
        [1, 1],
        [0, 0],
        [-1, -1],
        [-2, -3],
    ])).toEqual(expected);
});
test('Gaussian should create a gaussian', () => {
    expect(toMidi_1.testables.gaussian(10, 4)).toAllBeClose([
        0.53109599, 0.68194075, 0.82257756, 0.93210249, 0.99221794, 0.99221794,
        0.93210249, 0.82257756, 0.68194075, 0.53109599,
    ], 1e-4, 0);
});
test('midiPitchToContourBin should be able to convert 69', () => {
    expect(toMidi_1.testables.midiPitchToContourBin(69)).toEqual(144);
});
test('A MIDI buffer should be created with the correct data', () => {
    expect(new midi_1.Midi((0, toMidi_1.generateFileData)([
        {
            startTimeSeconds: 1,
            durationSeconds: 2,
            pitchMidi: 65,
            amplitude: 0.5,
        },
        {
            startTimeSeconds: 3,
            durationSeconds: 1,
            pitchMidi: 75,
            amplitude: 0.25,
        },
    ])).toJSON()).toEqual({
        header: {
            keySignatures: [],
            meta: [],
            name: '',
            ppq: 480,
            tempos: [],
            timeSignatures: [],
        },
        tracks: [
            {
                channel: 0,
                controlChanges: {},
                pitchBends: [],
                instrument: {
                    family: 'piano',
                    number: 0,
                    name: 'acoustic grand piano',
                },
                name: '',
                notes: [
                    {
                        duration: 2,
                        durationTicks: 1920,
                        midi: 65,
                        name: 'F4',
                        ticks: 960,
                        time: 1,
                        velocity: 0.49606299212598426,
                    },
                    {
                        duration: 1,
                        durationTicks: 960,
                        midi: 75,
                        name: 'D#5',
                        ticks: 2880,
                        time: 3,
                        velocity: 0.2440944881889764,
                    },
                ],
                endOfTrackTicks: 3840,
            },
        ],
    });
});
//# sourceMappingURL=toMidi.test.js.map