import { Item, ItemType, PathData, RenderConfig } from './types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Two from 'two.js';
const tinycolor  = require('tinycolor2');
const lodash  = require('lodash');
const chunk = lodash.chunk;

const render = (api: any, config: RenderConfig): void => {
  const width = config.width || 500;
  const height = config.height || 500;
  const title = config.title;
  const bgColor = config.backgroundColor || '#fff';
  const items: Item[] = config.items;

  // Set background
  // const bg = api.makeRectangle(width / 2, height / 2, width, height);
  // bg.noStroke();
  // bg.fill = bgColor;

  console.log('items, ', items);

  items
    .filter(a => a.type === ItemType.polygon)
    .forEach((item) => {
      const vert = chunk(item.points, 2).map(a => new Two.Vector(a[0], a[1]));
      const poly = api.makePath(vert, true);
      poly.fill = item.fill;
      if (item.gradient) {
        poly.fill = api.makeLinearGradient(
          item.gradient.x1, -item.gradient.y1,
          item.gradient.x2, item.gradient.y2,
          new Two.Stop(0, item.gradient.stops[0]),
          new Two.Stop(1, item.gradient.stops[1])
        );
      }
      poly.noStroke();
      item.target = poly;
    });

  // Render path
  document.querySelectorAll('#path')
    .forEach(path => {
      path.remove();
    })
  items
    .filter(a => a.type === ItemType.path)
    .forEach(item => {
      if(item.data){
        let fill = item.fill;
        if (item.gradient) {
          fill = api.makeLinearGradient(
            item.gradient.x1, -item.gradient.y1,
            item.gradient.x2, item.gradient.y2,
            new Two.Stop(0, item.gradient.stops[0]),
            new Two.Stop(1, item.gradient.stops[1])
          );
        }
        renderPath(api.renderer.domElement, item.data, fill);
      }
    });

  items
    .filter(a => a.type === ItemType.line)
    .forEach((item) => {
      const line = api.makeLine(item.points[0], item.points[1], item.points[2], item.points[3]);
      line.linewidth = item.strokeWidth;
      line.stroke = item.fill;
      line.cap = 'square';
      line.join = 'miter';
      item.target = line;
    });

  // Render curves
  document.querySelectorAll('#curve')
    .forEach(curve => {
      curve.remove();
    })
  items
    .filter(a => a.type === ItemType.curve)
    .forEach((item, i) => {
      renderCurve(api.renderer.domElement, item.points);
    });

  // ADD Text if enable
  if (title) {
    let textY = 25;
    title.split(' ').forEach(text => {
      api.makeText(text, 15, textY, {
        family: 'Ubuntu',
        alignment: 'left',
        size: 14, // TODO Size scale width
        fill: tinycolor.isReadable(bgColor, '#fff') ? '#fff' : '#000',
        weight: 100
      });
      textY += 20;
    });
  }

  // // Set border
  // const border = api.makeRectangle(width / 2, height / 2, width, height);
  // border.stroke = tinycolor.isReadable(bgColor, '#fff') ? '#fff' : '#000'; // bgColor;
  // border.linewidth = 5;
  // border.noFill();

  api.bind('update', function() {/**/});
};

export default render;

const renderCurve = (svg: any, curve: number[]) => {
  const ns = 'http://www.w3.org/2000/svg';
  const elem = document.createElementNS(ns, 'path');
  const d = `M ${curve[0]} ${curve[1]} C ${curve[2]}  ${curve[3]}  ${curve[4]}  ${curve[5]}  ${curve[6]}  ${curve[7]}`;

  elem.setAttribute('d', d);
  elem.setAttribute('fill', 'none');
  elem.setAttribute('stroke-width', '1');
  elem.setAttribute('stroke', 'black');
  elem.id = 'curve';
  svg.appendChild(elem);
}

const renderPath = (svg: any, path: PathData, fill: any) => {
  const ns = 'http://www.w3.org/2000/svg';
  const elem = document.createElementNS(ns, 'path');
  const firstChild = svg.firstChild;

  let d = '';
  Object.keys(path).forEach(p => {
    const data = path[p];
    d += `${data.command} ${data.points.join(' ')} `;
  });

  elem.setAttribute('d', d);
  elem.setAttribute('fill', typeof fill === 'string' ? fill : `url(#${fill.id})`);
  elem.id = 'path';
  // svg.appendChild(elem);
  svg.insertBefore(elem, firstChild);
};
