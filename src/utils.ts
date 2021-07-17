const lodash  = require('lodash');
const shuffle = lodash.shuffle;

export const RN = (minimum: number, maximum: number): number => {
  return Math.round(Math.random() * (maximum - minimum) + minimum);
};

export const RC = (arr: any[]): any => {
  return shuffle(arr)[0];
};

export const chunk = <T>(array: T[], chunkSize: number): T[][]  => {
  const R = [];
  for (let i = 0, len = array.length; i < len; i += chunkSize) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    R.push(array.slice(i, i + chunkSize));
  }
  return R;
};
