import {ItemGradient} from './types';
import { RC, RGN } from './utils';

import * as tinycolor_ from 'tinycolor2';
const tinycolor = tinycolor_;

export const gradient = (color: string, height: number): ItemGradient => {
  const color1 = tinycolor(color);
  let colors = color1.triad();
  if (RGN(0, 4) === 0) {
    colors = color1.tetrad();
  }
  if (RGN(0, 4) === 1) {
    colors = color1.splitcomplement();
  }
  if (RGN(0, 4) === 2) {
    colors = color1.monochromatic();
  }
  if (RGN(0, 4) === 3) {
    colors = color1.analogous();
  }
  const color2 = RC(colors).toHexString();
  return {
    x1: 0,
    y1: height,
    x2: 0,
    y2: height,
    stops: [
      color === 'transparent' ? 'transparent' : color1.toHexString(),
      color === 'transparent' ? 'transparent' : color2
    ]
  };
};
