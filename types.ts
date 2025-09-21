export interface Character {
  id: string;
  name: string;
  referenceImage: {
    name: string;
    data: string;
  } | null;
  clothingReferenceImage: {
    name: string;
    data: string;
  } | null;
  nationality: string;
  characteristics: string;
  clothing: string;
  mainAction: string;
  emotion: string;
  previewDescription?: string;
  previewImageUrl?: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  content: string;
  language: string;
}

export interface PromptState {
  mainDescription: string;
  characters: Character[];
  background: {
    location: string;
    time: string;
    weather: string;
    season: string;
    crowdLevel: string;
  };
  camera: {
    style: string;
    movement: string;
    angle: string;
    focus: string;
    lighting: string;
    colorGrading: string;
  };
  audio: {
    dialogueType: string;
    dialogueTone: string;
    dialogues: DialogueLine[];
    mood: string;
    ambientSound: string;
    backgroundMusic: string;
  };
  /** Menyimpan kualitas video yang diinginkan oleh pengguna (misalnya: "4K", "HD", "Realistis"). */
  videoQuality: string;
  visualStyle: string;
  additionalDetails: string;
  aspectRatio: string;
  negativePrompt: string;
  outputModel: string;
}
