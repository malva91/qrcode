export type ECLevel = 'L' | 'M' | 'Q' | 'H';
export type MaskStrategy = 'auto' | 'optimize' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type QRStyle = 'classic' | 'runes-romb' | 'runes-strokes' | 'pure';
export type FinderStyle = 'classic' | 'stone' | 'none';
export type BorderStyle = 'none' | 'viking' | 'runes';

export interface VikingQROptions {
  ecLevel?: ECLevel;
  moduleSize?: number;
  margin?: number;
  style?: QRStyle;
  finderStyle?: FinderStyle;
  borderStyle?: BorderStyle;
  maskStrategy?: MaskStrategy;
  flipBudget?: number; // 0..0.15
  seed?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  runeDensity?: number; // 0..1
  centerLogo?: string; // SVG path
}

export interface QRMatrix {
  modules: boolean[][];
  size: number;
  version: number;
  ecLevel: ECLevel;
  mask: number;
}

export interface ModuleInfo {
  x: number;
  y: number;
  isDark: boolean;
  type: 'data' | 'finder' | 'timing' | 'alignment' | 'format' | 'version' | 'quiet';
}