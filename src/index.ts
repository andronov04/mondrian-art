import generator from './generator';
import render from './render';
import {IMondrian, Item, ItemType, MondrianArtConfig} from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Two from 'two.js';
import animate from './animate';
import { RGN } from './utils';

class Mondrian implements IMondrian {
  config;
  api;
  anime;
  constructor(config: MondrianArtConfig) {
    this.config = config;
    const mode = config.mode || 'svg';

    // Init render Engine
    this.api = new Two({
      type: mode === 'svg' ? Two.Types.svg : Two.Types.canvas,
      width: this.config.width,
      height: this.config.height,
      autostart: true
    });
    this.api.appendTo(this.config.container);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.api = this.api;
  }

  reconfigure = (config: MondrianArtConfig): void => {
    this.config = config;

    this.api.clear();
    this.api.renderer.setSize(this.config.width, this.config.height, this.api.ratio);
  }

  generate = (): void => {
    this.api.clear();
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
        item.target.translation.x = RGN(-8, 8);
        item.target.translation.y = RGN(-8, 8);
      });
    }
    // 4. Animate if enable,
    if (config.enableAnimation) {
      this.anime = animate(items, config.mondrian?.enableSnaking);
    }
    // Ugly hack for tests
    // @ts-ignore
    this.items = items;
  }

  play = (): void => {
    this.anime?.restart();
  }
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.Mondrian = Mondrian;
export default Mondrian;
