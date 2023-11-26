import { WebGAL } from '@/Core/WebGAL';

interface IAudioContextWrapper {
  audioContext: AudioContext;
  source: MediaElementAudioSourceNode | null;
  analyser: AnalyserNode | undefined;
  dataArray: Uint8Array | undefined;
  audioLevelInterval: ReturnType<typeof setInterval>;
  blinkTimerID: ReturnType<typeof setTimeout>;
  maxAudioLevel: number;
}

// Initialize the object based on the interface
export const audioContextWrapper: IAudioContextWrapper = {
  audioContext: new AudioContext(),
  source: null,
  analyser: undefined,
  dataArray: undefined,
  audioLevelInterval: setInterval(() => {}, 0), // dummy interval
  blinkTimerID: setTimeout(() => {}, 0), // dummy timeout
  maxAudioLevel: 0,
};

export const updateThresholds = (audioLevel: number) => {
  audioContextWrapper.maxAudioLevel = Math.max(audioLevel, audioContextWrapper.maxAudioLevel);
  return {
    OPEN_THRESHOLD: audioContextWrapper.maxAudioLevel * 0.75,
    HALF_OPEN_THRESHOLD: audioContextWrapper.maxAudioLevel * 0.5,
  };
};

export const performBlinkAnimation = (params: {
  key: string;
  animationItem: any;
  pos: string;
  animationEndTime: number;
}) => {
  let isBlinking = false;

  function blink() {
    if (isBlinking || (params.animationEndTime && Date.now() > params.animationEndTime)) return;
    isBlinking = true;
    WebGAL.gameplay.pixiStage?.performBlinkAnimation(params.key, params.animationItem, 'closed', params.pos);
    audioContextWrapper.blinkTimerID = setTimeout(() => {
      WebGAL.gameplay.pixiStage?.performBlinkAnimation(params.key, params.animationItem, 'open', params.pos);
      isBlinking = false;
      const nextBlinkTime = Math.random() * 300 + 3500;
      audioContextWrapper.blinkTimerID = setTimeout(blink, nextBlinkTime);
    }, 200);
  }
  blink();
};

// Updated getAudioLevel function
export const getAudioLevel = (analyser: AnalyserNode, dataArray: Uint8Array, bufferLength: number): number => {
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  return sum / bufferLength;
};

export const performMouthAnimation = (params: {
  audioLevel: number;
  OPEN_THRESHOLD: number;
  HALF_OPEN_THRESHOLD: number;
  currentMouthValue: number;
  lerpSpeed: number;
  key: string;
  animationItem: any;
  pos: string;
}) => {
  const { audioLevel, OPEN_THRESHOLD, HALF_OPEN_THRESHOLD, currentMouthValue, lerpSpeed, key, animationItem, pos } =
    params;

  let targetValue;
  if (audioLevel > OPEN_THRESHOLD) {
    targetValue = 1; // open
  } else if (audioLevel > HALF_OPEN_THRESHOLD) {
    targetValue = 0.5; // half_open
  } else {
    targetValue = 0; // closed
  }
  // Lerp
  const mouthValue = currentMouthValue + (targetValue - currentMouthValue) * lerpSpeed;
  WebGAL.gameplay.pixiStage?.setModelMouthY(key, audioLevel);

  let mouthState;
  if (mouthValue > 0.75) {
    mouthState = 'open';
  } else if (mouthValue > 0.25) {
    mouthState = 'half_open';
  } else {
    mouthState = 'closed';
  }
  if (animationItem !== undefined) {
    WebGAL.gameplay.pixiStage?.performMouthSyncAnimation(key, animationItem, mouthState, pos);
  }
};
