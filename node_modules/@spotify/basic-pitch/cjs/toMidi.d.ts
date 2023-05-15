/// <reference types="node" />
declare type Optional<T> = T | null;
export declare type NoteEvent = {
    startFrame: number;
    durationFrames: number;
    pitchMidi: number;
    amplitude: number;
    pitchBends?: number[];
};
export interface NoteEventTime {
    startTimeSeconds: number;
    durationSeconds: number;
    pitchMidi: number;
    amplitude: number;
    pitchBends?: number[];
}
declare function argMax(arr: number[]): Optional<number>;
declare function whereGreaterThanAxis1(arr2d: number[][], threshold: number): [number[], number[]];
declare function meanStdDev(array: number[][]): [number, number];
declare function globalMax(array: number[][]): number;
declare function min3dForAxis0(array: number[][][]): number[][];
declare function argRelMax(array: number[][], order?: number): [number, number][];
declare function max3dForAxis0(array: number[][][]): number[][];
declare function constrainFrequency(onsets: number[][], frames: number[][], maxFreq: Optional<number>, minFreq: Optional<number>): void;
declare function getInferredOnsets(onsets: number[][], frames: number[][], nDiff?: number): number[][];
export declare function outputToNotesPoly(frames: number[][], onsets: number[][], onsetThresh?: number, frameThresh?: number, minNoteLen?: number, inferOnsets?: boolean, maxFreq?: Optional<number>, minFreq?: Optional<number>, melodiaTrick?: boolean, energyTolerance?: number): NoteEvent[];
export declare function addPitchBendsToNoteEvents(contours: number[][], notes: NoteEvent[], nBinsTolerance?: number): NoteEvent[];
export declare const noteFramesToTime: (notes: NoteEvent[]) => NoteEventTime[];
export declare function generateFileData(notes: NoteEventTime[]): Buffer;
export declare const testables: {
    argRelMax: typeof argRelMax;
    argMax: typeof argMax;
    argMaxAxis1: (arr: number[][]) => number[];
    whereGreaterThanAxis1: typeof whereGreaterThanAxis1;
    meanStdDev: typeof meanStdDev;
    globalMax: typeof globalMax;
    min3dForAxis0: typeof min3dForAxis0;
    max3dForAxis0: typeof max3dForAxis0;
    getInferredOnsets: typeof getInferredOnsets;
    constrainFrequency: typeof constrainFrequency;
    modelFrameToTime: (frame: number) => number;
    hzToMidi: (hz: number) => number;
    generateFileData: typeof generateFileData;
    noteFramesToTime: (notes: NoteEvent[]) => NoteEventTime[];
    gaussian: (M: number, std: number) => number[];
    midiPitchToContourBin: (pitchMidi: number) => number;
    midiToHz: (midi: number) => number;
};
export {};
