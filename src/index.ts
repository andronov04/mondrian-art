import generator from './generator';
import render from './render';
import {IMondrian, Item, MondrianArtConfig} from './types';
// @ts-ignore
import Two from 'two.js';
import animate from './animate';

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

  reconfigure = (config: MondrianArtConfig) => {
    this.config = config;

    this.api.clear();
    this.api.renderer.setSize(this.config.width, this.config.height, this.api.ratio);
  }

  generate = () => {
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

    // 3. Animate if enable,
    if (config.enableAnimation) {
      this.anime = animate(items);
    }
  }

  play = () => {
    this.anime?.restart();
  }
}

export default Mondrian;
