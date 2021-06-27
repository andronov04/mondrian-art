import {ItemGradient} from './types';
import { RN } from './utils';
const tinycolor  = require('tinycolor2');
const lodash  = require('lodash');

export const gradient = (color: string): ItemGradient => {
  const color1 = tinycolor(color);
  let colors = color1.triad();
  if (RN(0, 4) === 0) {
    colors = color1.tetrad();
  }
  if (RN(0, 4) === 1) {
    colors = color1.splitcomplement();
  }
  if (RN(0, 4) === 2) {
    colors = color1.monochromatic();
  }
  if (RN(0, 4) === 3) {
    colors = color1.analogous();
  }
  const color2 = lodash.shuffle(colors)[0].toHexString();
  return {
    x1: 0,
    y1: 500,
    x2: 0,
    y2: 500,
    stops: [
      color === 'transparent' ? 'transparent' : color1.toHexString(),
      color === 'transparent' ? 'transparent' : color2
    ]
  };
};
