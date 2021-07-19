
export interface ConfigMondrian {
  palette?: string[];
  style?: 'neo' | 'classic' | 'random'; // Shapes (?)
  enableGradient?: boolean;
  enableSnaking?: boolean;
  lineWidth?: 1 | 2.5 | 5 | number | 'random';
  title?: string; // Default - Piet Mondrian
  backgroundColor?: string;
}

export interface PathData {
  command: 'M' | 'C' | 'L';
  points: number[];
}

export interface GeneratorData {
  lines: number[][];
  curves: number[][];
  polygons: number[][];
  paths: PathData[][];
}

export enum ItemType {
  custom,
  polygon,
  line,
  rectangle,
  text,
  curve,
  path,
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
  data?: PathData;
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
  mode?: "svg" | "canvas";
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
  config: MondrianArtConfig;

  reconfigure: (config: MondrianArtConfig) => void;
  generate: () => void;
  play: () => void;
}
