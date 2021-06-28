import generator from './generator';
import render from './render';
import {IMondrian, Item, ItemType, MondrianArtConfig} from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Two from 'two.js';
import animate from './animate';
import { RN } from './utils';

class Mondrian implements IMondrian {
  config;
  api;
  anime;
  constructor(config: MondrianArtConfig) {
    this.config = config;

    // Init render Engine
    this.api = new Two({
      type: Two.Types.svg,
      width: this.config.width,
      height: this.config.height,
      autostart: true
    });
    this.api.appendTo(this.config.container);
  }

  reconfigure = (config: MondrianArtConfig): void => {
    this.config = config;

    this.api.clear();
    this.api.renderer.setSize(this.config.width, this.config.height, this.api.ratio);
  }

  generate = (): void => {
    const config = this.config;
    // 1. Generate lines and polygons. Grid.
    const items: Item[] = generator(config);

    // 2. Render items. Use for it's two.js
    render(this.api, {
      items,
      container: config.container,
      width: config.width,
      height: config.height,
      title: config.mondrian?.title,
      backgroundColor: config.mondrian?.backgroundColor
    });

    // 3. Snaking if enable
    if (config.mondrian?.enableSnaking) {
      items.filter(a => a.type === ItemType.line).forEach(item => {
        item.target.translation.x = RN(-8, 8);
        item.target.translation.y = RN(-8, 8);
      });
    }
    // 4. Animate if enable,
    if (config.enableAnimation) {
      this.anime = animate(items, config.mondrian?.enableSnaking);
    }
  }

  play = (): void => {
    this.anime?.restart();
  }
}

export default Mondrian;
