export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  /**
   * Request microphone permission and initialize recorder
   */
  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      // Create audio context for visualization
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
    } catch (error) {
      console.error('Error initializing audio recorder:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error('Recorder not initialized. Call initialize() first.');
    }

    this.audioChunks = [];
    this.mediaRecorder.start();
  }

  /**
   * Stop recording and return audio blob and buffer
   */
  async stopRecording(): Promise<{ blob: Blob; buffer: AudioBuffer }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const buffer = await this.convertBlobToAudioBuffer(blob);
          resolve({ blob, buffer });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Convert blob to AudioBuffer for processing
   */
  private async convertBlobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  /**
   * Get current audio level (0-255) for visualization
   */
  getAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    return sum / dataArray.length;
  }

  /**
   * Get frequency data for waveform visualization
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Get time domain data for waveform visualization
   */
  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.mediaRecorder = null;
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.audioChunks = [];
  }
}

/**
 * Helper function to record audio for a specific duration
 */
export async function recordAudio(durationMs: number): Promise<AudioBuffer> {
  const recorder = new AudioRecorder();
  await recorder.initialize();
  
  recorder.startRecording();
  
  await new Promise((resolve) => setTimeout(resolve, durationMs));
  
  const { buffer } = await recorder.stopRecording();
  recorder.cleanup();
  
  return buffer;
}

