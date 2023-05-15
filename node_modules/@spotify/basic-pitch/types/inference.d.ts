import * as tf from '@tensorflow/tfjs';
import { NoteEventTime } from './toMidi';
export declare type OnCompleteCallback = (frames: number[][], onsets: number[][], conotours: number[][]) => void;
export declare class BasicPitch {
    model: Promise<tf.GraphModel>;
    constructor(modelOrModelPath: string | Promise<tf.GraphModel>);
    adjustNoteStart(notes: NoteEventTime[], offsetSeconds: number): {
        startTimeSeconds: number;
        durationSeconds: number;
        pitch_midi: number;
        amplitude: number;
        pitchBends: number[] | undefined;
    }[];
    evaluateSingleFrame(reshapedInput: tf.Tensor3D, batchNumber: number): Promise<[tf.Tensor3D, tf.Tensor3D, tf.Tensor3D]>;
    prepareData(singleChannelAudioData: Float32Array): Promise<[tf.Tensor3D, number]>;
    unwrapOutput(result: tf.Tensor3D): tf.Tensor2D;
    evaluateModel(resampledBuffer: AudioBuffer | Float32Array, onComplete: OnCompleteCallback, percentCallback: (percent: number) => void): Promise<void>;
}
//# sourceMappingURL=inference.d.ts.map