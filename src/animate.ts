import anime from 'animejs/lib/anime.es.js';
import {Item, ItemType} from "./types";
import {RN} from "./utils";


const animate = (items: Item[]) => {
  const animation: any = [];

  // Animate lines
  items.filter(a => a.type === ItemType.line).forEach(item => {
    const anim = {
      x: RN(-700, 700),
      y: RN(-700, 700),
      rotation: 2.5,
      target: item.target,
    };
    animation.push(anim);
    item.target.translation.x = anim.x;
    item.target.translation.y = anim.y;
  })

  // Animate polygons
  items.filter(a => a.type === ItemType.polygon).forEach(item => {
    const anim = {
      opacity: 0,
      target: item.target,
    };
    animation.push(anim);
    item.target.opacity = 0;
  })

  // TODO Keyframes to gen
  return anime({
    targets: animation,
    x: [
      { value: 0, duration: 1000, delay: 0 }
    ],
    y: [
      { value: 0, duration: 1000, delay: 0 }
    ],
    opacity: [
      { value: 1, duration: 1000, delay: 1000 }
    ],
    // rotation: 0,
    duration: 1000,
    easing: 'linear',
    update: () => {
      animation.forEach(anim => {
        anim.x ? anim.target.translation.x = anim.x : null;
        anim.y ? anim.target.translation.y = anim.y : null;
        anim.opacity ? anim.target.opacity = anim.opacity : null;
      })
    },
    complete: (anim) => {

    }
  });
}

export default animate;
