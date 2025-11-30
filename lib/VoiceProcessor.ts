import * as tf from '@tensorflow/tfjs';

export class VoiceProcessor {
  private static SAMPLE_RATE = 16000;
  private static FFT_SIZE = 1024;
  private static N_MFCC = 13;
  private static HOP_LENGTH = 512;

  /**
   * Extract MFCC features from audio buffer
   * Returns a flattened array of MFCC coefficients
   */
  static async extractMFCC(audioBuffer: AudioBuffer): Promise<number[]> {
    // Resample audio to 16kHz if needed
    const audioData = await this.resampleAudio(audioBuffer, this.SAMPLE_RATE);
    
    // Convert to tensor
    const audioTensor = tf.tensor1d(audioData);
    
    // Apply pre-emphasis filter
    const preEmphasized = this.preEmphasis(audioTensor);
    
    // Compute STFT (Short-Time Fourier Transform)
    const stft = await this.computeSTFT(preEmphasized);
    
    // Compute mel filterbank
    const melSpec = await this.computeMelSpectrogram(stft);
    
    // Compute MFCC
    const mfcc = await this.computeMFCC(melSpec);
    
    // Clean up tensors
    audioTensor.dispose();
    preEmphasized.dispose();
    stft.dispose();
    melSpec.dispose();
    
    // Flatten and return as array
    const mfccArray = await mfcc.data();
    mfcc.dispose();
    
    return Array.from(mfccArray);
  }

  /**
   * Resample audio to target sample rate
   */
  private static async resampleAudio(
    audioBuffer: AudioBuffer,
    targetSampleRate: number
  ): Promise<Float32Array> {
    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil((audioBuffer.length * targetSampleRate) / audioBuffer.sampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampled = await offlineCtx.startRendering();
    return resampled.getChannelData(0);
  }

  /**
   * Apply pre-emphasis filter to boost high frequencies
   */
  private static preEmphasis(signal: tf.Tensor1D, coefficient = 0.97): tf.Tensor1D {
    return tf.tidy(() => {
      const shifted = tf.concat([tf.zeros([1]), signal.slice(0, signal.shape[0] - 1)]);
      return signal.sub(shifted.mul(coefficient)) as tf.Tensor1D;
    });
  }

  /**
   * Compute Short-Time Fourier Transform
   */
  private static async computeSTFT(signal: tf.Tensor1D): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      const frameLength = this.FFT_SIZE;
      const hopLength = this.HOP_LENGTH;
      const signalLength = signal.shape[0];
      const numFrames = Math.floor((signalLength - frameLength) / hopLength) + 1;

      // Hann window
      const window = tf.signal.hannWindow(frameLength);

      const frames: tf.Tensor1D[] = [];
      for (let i = 0; i < numFrames; i++) {
        const start = i * hopLength;
        const frame = signal.slice(start, frameLength);
        const windowedFrame = frame.mul(window);
        frames.push(windowedFrame as tf.Tensor1D);
      }

      const framedSignal = tf.stack(frames);
      
      // Compute FFT for each frame
      const fft = tf.spectral.rfft(framedSignal);
      
      // Compute magnitude
      const magnitude = tf.abs(fft);
      
      // Clean up
      frames.forEach(f => f.dispose());
      framedSignal.dispose();
      fft.dispose();
      
      return magnitude as tf.Tensor2D;
    });
  }

  /**
   * Compute Mel Spectrogram
   */
  private static async computeMelSpectrogram(stft: tf.Tensor2D): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      // Square the magnitude to get power spectrum
      const powerSpectrum = stft.square();
      
      // Apply mel filterbank
      // powerSpectrum: (numFrames, numFreqBins) e.g., (60, 513)
      // melFilterbank: (numFreqBins, numMelBins) e.g., (513, 40)
      // Result: (numFrames, numMelBins) e.g., (60, 40)
      const melFilterbank = this.createMelFilterbank();
      const melSpec = tf.matMul(powerSpectrum, melFilterbank);
      
      // Apply log
      const logMelSpec = tf.log(melSpec.add(1e-10));
      
      powerSpectrum.dispose();
      melFilterbank.dispose();
      
      return logMelSpec as tf.Tensor2D;
    });
  }

  /**
   * Create Mel filterbank
   */
  private static createMelFilterbank(numMelBins = 40): tf.Tensor2D {
    return tf.tidy(() => {
      const numFreqBins = Math.floor(this.FFT_SIZE / 2) + 1;
      
      // Create filterbank with proper initialization
      const filterbank: number[][] = [];
      for (let i = 0; i < numFreqBins; i++) {
        filterbank[i] = new Array(numMelBins).fill(0);
      }
      
      for (let i = 0; i < numMelBins; i++) {
        const start = Math.floor((i * numFreqBins) / numMelBins);
        const end = Math.min(Math.floor(((i + 2) * numFreqBins) / numMelBins), numFreqBins);
        const peak = Math.floor(((i + 1) * numFreqBins) / numMelBins);
        
        for (let j = start; j < end; j++) {
          if (j >= numFreqBins) break; // Safety check
          
          if (j < peak && (peak - start) > 0) {
            filterbank[j][i] = (j - start) / (peak - start);
          } else if ((end - peak) > 0) {
            filterbank[j][i] = (end - j) / (end - peak);
          }
        }
      }
      
      return tf.tensor2d(filterbank);
    });
  }

  /**
   * Compute MFCC from Mel Spectrogram using DCT
   */
  private static async computeMFCC(melSpectrogram: tf.Tensor2D): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      const [numFrames, numMelBins] = melSpectrogram.shape;
      
      // Create DCT matrix
      // dctMatrix: (N_MFCC, numMelBins) e.g., (13, 40)
      // We need to transpose it to (numMelBins, N_MFCC) for correct multiplication
      const dctMatrix = this.createDCTMatrix(numMelBins, this.N_MFCC);
      
      // Apply DCT
      // melSpectrogram: (numFrames, numMelBins) e.g., (60, 40)
      // dctMatrix.transpose(): (numMelBins, N_MFCC) e.g., (40, 13)
      // Result: (numFrames, N_MFCC) e.g., (60, 13)
      const dctMatrixT = tf.transpose(dctMatrix);
      const mfcc = tf.matMul(melSpectrogram, dctMatrixT);
      
      dctMatrix.dispose();
      dctMatrixT.dispose();
      
      return mfcc as tf.Tensor2D;
    });
  }

  /**
   * Create Discrete Cosine Transform matrix
   */
  private static createDCTMatrix(numMelBins: number, numMFCC: number): tf.Tensor2D {
    return tf.tidy(() => {
      const matrix: number[][] = [];
      
      for (let k = 0; k < numMFCC; k++) {
        const row: number[] = [];
        for (let n = 0; n < numMelBins; n++) {
          row.push(Math.cos((Math.PI * k * (n + 0.5)) / numMelBins));
        }
        matrix.push(row);
      }
      
      return tf.tensor2d(matrix);
    });
  }

  /**
   * Compute average of multiple MFCC vectors (for registration)
   */
  static averageMFCCs(mfccVectors: number[][]): number[] {
    if (mfccVectors.length === 0) return [];
    
    const avgLength = Math.min(...mfccVectors.map(v => v.length));
    const averaged: number[] = [];
    
    for (let i = 0; i < avgLength; i++) {
      const sum = mfccVectors.reduce((acc, vec) => acc + (vec[i] || 0), 0);
      averaged.push(sum / mfccVectors.length);
    }
    
    return averaged;
  }

  /**
   * Compute cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    // Ensure vectors are same length
    const minLength = Math.min(vecA.length, vecB.length);
    const a = vecA.slice(0, minLength);
    const b = vecB.slice(0, minLength);
    
    // Compute dot product
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    
    // Compute magnitudes
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Normalize MFCC vector (optional, for better matching)
   */
  static normalizeMFCC(mfcc: number[]): number[] {
    const mean = mfcc.reduce((sum, val) => sum + val, 0) / mfcc.length;
    const std = Math.sqrt(
      mfcc.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / mfcc.length
    );
    
    if (std === 0) return mfcc.map(() => 0);
    
    return mfcc.map(val => (val - mean) / std);
  }
}

