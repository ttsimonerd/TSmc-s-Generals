export enum AppView {
  GALLERY = 'GALLERY',
  SEARCH_GROUNDING = 'SEARCH_GROUNDING',
  THINKING_MODE = 'THINKING_MODE',
  RNG_TACTICIAN = 'RNG_TACTICIAN',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResponseData {
  text: string;
  groundingChunks?: GroundingChunk[];
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

// Augment the global Window interface
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}