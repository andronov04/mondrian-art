export const RN = (minimum: number, maximum: number): number => {
  return Math.round(Math.random() * (maximum - minimum) + minimum);
};
