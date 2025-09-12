/**
 * Voice interface for hands-free interaction
 * Integrates Web Speech API for speech recognition and synthesis
 */
export class VoiceInterface {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  startListening(onResult: (transcript: string) => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Speech recognition not supported';
        onError?.(error);
        reject(error);
        return;
      }

      if (this.isListening) {
        resolve();
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
        resolve();
      };

      this.recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`;
        onError?.(error);
        this.isListening = false;
        reject(error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const errorMsg = 'Failed to start speech recognition';
        onError?.(errorMsg);
        reject(errorMsg);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject('Speech synthesis not supported');
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      
      if (options.voice) {
        utterance.voice = options.voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(`Speech synthesis error: ${event.error}`);

      this.synthesis.speak(utterance);
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}