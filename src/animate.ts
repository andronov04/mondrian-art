import anime from 'animejs/lib/anime.es.js';
import {Item, ItemType} from './types';
import { RGN, RN } from './utils';

const animate = (items: Item[], snaking = false): any => {
  const animation: any = [];

  // Animate lines
  items.filter(a => a.type === ItemType.line).forEach(item => {
    const anim = {
      x: RGN(-700, 700),
      y: RGN(-700, 700),
      rotation: 2.5,
      target: item.target
      // ending: 1,
    };
    animation.push(anim);
    // item.target.ending = anim.ending;
    item.target.translation.x = anim.x;
    item.target.translation.y = anim.y;
  });

  // Animate polygons
  items.filter(a => a.type === ItemType.polygon).forEach(item => {
    const anim = {
      opacity: 0,
      target: item.target
    };
    animation.push(anim);
    item.target.opacity = 0;
  });

  const copy_animation = animation.map(a => { return {...a, target: a.target?.id}; });

  const anim = anime({
    targets: animation,
    x: [
      { value: snaking ? RGN(-8, 8) : 0, duration: 1500, delay: 0 }
    ],
    y: [
      { value: snaking ? RGN(-8, 8) : 0, duration: 1500, delay: 0 }
    ],
    // ending: [
    //   { value: 1, duration: 1000, delay: 500 }
    // ],
    opacity: [
      { value: 1, duration: 1000, delay: 1500 }
    ],
    // rotation: 0,
    duration: 1500,
    easing: 'linear',
    update: () => {
      animation.forEach(anim => {
        if (anim.x !== undefined) {
          anim.target.translation.x = anim.x;
        }
        if (anim.y !== undefined) {
          anim.target.translation.y = anim.y;
        }
        if (anim.ending !== undefined) {
          anim.target.ending = anim.ending;
        }
        if (anim.opacity !== undefined) {
          anim.target.opacity = anim.opacity;
        }
      });
    }
  });

  // Ugly hack for tests
  anim.items = items;
  anim.animation = copy_animation;

  return anim;
};

export default animate;
