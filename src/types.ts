
export interface ConfigMondrian {
  palette?: string[];
  style?: 'neo' | 'classic' | 'random'; // Shapes (?)
  enableGradient?: boolean;
  lineWidth?: 1 | 2.5 | 5 | number | 'random';
  title?: string; // Default - Piet Mondrian
  backgroundColor?: string;
}

export interface GeneratorData {
  lines: number[][];
  polygons: number[][];
}

export enum ItemType {
  custom,
  polygon,
  line,
  rectangle,
  text
}

export interface ItemGradient {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  stops: string[]; // colors
}

export interface Item {
  points: number[];
  type: ItemType;
  fill: string;
  strokeWidth?: number;
  gradient?: ItemGradient;
  [key: string]: any; // for text and any
  target: any;
}

export interface MondrianArtConfig {
  mondrian?: ConfigMondrian;
  width?: number;
  height?: number;
  enableAnimation?: boolean;
  container?: HTMLElement | null;
}

export interface RenderConfig {
  container?: HTMLElement;
  items: Item[];
  width?: number;
  height?: number;
  title?: string;
  backgroundColor?: string;
}

//  TODO Refactoring
export type TPoint = {
  x: number
  y: number
  i?: number
  origX?: number
  origY?: number
  toIdx?: number
  id?: number
  angle?: number
  line0: number
  line1: number
};
export interface IMondrian {
  api: any;
  anime: any;
  config: MondrianArtConfig;

  reconfigure: (config: MondrianArtConfig) => void;
  generate: () => void;
  play: () => void;
}
