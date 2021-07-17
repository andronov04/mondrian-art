import {Graph} from './graph';
import { MondrianArtConfig, GeneratorData, Item, ItemType, TPoint, PathData } from './types';
import { RC, RN } from './utils';
import {gradient} from './styling';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Bezier } from './lib/bezier.js';

const isect = require('isect');
const tinycolor  = require('tinycolor2');
const lodash  = require('lodash');
const shuffle = lodash.shuffle;

export default (config: MondrianArtConfig): Item[] => {
  const width = config.width || 500;
  const height = config.height || 500;
  let style = config.mondrian?.style || 'random';
  const lineWidth = config.mondrian?.lineWidth || 1;
  const backgroundColor = config.mondrian?.backgroundColor || '#fff';
  const enableGradient = config.mondrian?.enableGradient || false;
  const palette = config.mondrian?.palette || ['#0e448c', '#f61710', '#ffd313'];

  if (style === 'random') {
    style = shuffle(['neo', 'classic'])[0];
  }

  // 1. Generate lines and polygons (rects). Default it's random
  let data;
  if (style === 'classic') {
    // Classic generator
    data = classicGenerator(width, height);
  }
  if (style === 'neo') {
    // Neo generator
    data = neoGenerator(width, height);
  }

  // 2. Generate style
  const items: Item[] = [];

  // Style lines
  data.lines.forEach(line => {
    items.push({
      type: ItemType.line,
      points: line,
      fill:  tinycolor.isReadable(backgroundColor, '#fff') ? '#fff' : '#000',
      strokeWidth: lineWidth === 'random' ? RN(0.5, 4) : lineWidth,
      target: null
    });
  });
  // Style polygons
  data.polygons.forEach(polygon => {
    items.push({
      type: ItemType.polygon,
      points: polygon,
      gradient: enableGradient ? gradient(shuffle(palette)[0], height) : undefined,
      fill: shuffle(palette)[0],
      target: null
    });
  });
  // Style paths
  data.paths.forEach(path => {
    items.push({
      type: ItemType.path,
      points: [],
      data: path,
      gradient: enableGradient ? gradient(RC(palette), height) : undefined,
      fill: RC(palette),
      target: null
    });
  });
  // Style curves
  data.curves.forEach(curve => {
    items.push({
      type: ItemType.curve,
      points: curve,
      fill:  tinycolor.isReadable(backgroundColor, '#fff') ? '#fff' : '#000',
      strokeWidth: lineWidth === 'random' ? RN(0.5, 4) : lineWidth,
      target: null
    });
  });

  return items;
};

const neoGenerator = (width: number, height: number): GeneratorData => {
  const maxValue = Math.floor((width > height ? width : height) / 100 * 30);
  const w = RN(30, width - Math.floor(width / 100 * 10));
  const h = RN(30, height - Math.floor(height / 100 * 10));
  const r = {
    x: (width - w) / 2,
    y: (height - h) / 2,
    w: w,
    h: h
  };
  const lines: number[][] = [];
  const skew = RN(1, 5) === 3;
  const skewX = skew ? RN(-20, 20) : 0;
  const skewY = skew ? RN(-20, 20) : 0;
  const isAdd = !(RN(1, 5) === 3);

  const genExtraDots = (points: TPoint[]): TPoint[] => {
    const extra_points: TPoint[] = [];
    points.slice(0, 2).forEach((point, i) => {
      const dot1 = isAdd ? RN(-maxValue, maxValue) : RN(-maxValue / 2, maxValue / 2);
      const dot2 = isAdd ? RN(-maxValue, maxValue) : -dot1;
      const dot3 = isAdd ? RN(-maxValue, maxValue) : RN(-maxValue / 2, maxValue / 2);
      const dot4 = isAdd ? RN(-maxValue, maxValue) : -dot3;

      const { x, y, toIdx } = point;
      const { x: x1, y: y1 } = points[toIdx || 0];
      const angle = Math.atan2(y1 - y, x1 - x);

      const { x: x2, y: y2, toIdx: t2 } = points[i + 2];
      const { x: x21, y: y21 } = points[t2 || 0];
      const angle2 = Math.atan2(y21 - y2, x21 - x2);

      extra_points.push(...[
        {
          x: ((x2 + x21) / 2) - dot1 * Math.cos(angle2),
          y: ((y2 + y21) / 2) - dot1 * Math.sin(angle2),
          toIdx: points.length + extra_points.length + 1,
          line0: 0,
          line1: 1
        },
        {
          x: ((x + x1) / 2) - dot2 * Math.cos(angle),
          y: ((y + y1) / 2) - dot2 * Math.sin(angle),
          line0: 0,
          line1: 1
        }
      ]);
      if (i === RN(1, 2)) {
        extra_points.push(...[
          {
            x: ((x2 + x21) / 2) - dot3 * Math.cos(angle2), // RN(-100, 100)
            y: ((y2 + y21) / 2) - dot3 * Math.sin(angle2),
            toIdx: points.length + extra_points.length + 1,
            line0: 0,
            line1: 1
          },
          {
            x: ((x + x1) / 2) - dot4 * Math.cos(angle),
            y: ((y + y1) / 2) - dot4 * Math.sin(angle),
            line0: 0,
            line1: 1
          }
        ]);
      }
    });
    return extra_points;
  };
  let dots: TPoint[] = [
    {
      x: r.x,
      y: r.x,
      toIdx: 1,
      line0: 0,
      line1: 1
    },
    {
      x: r.x + r.w,
      y: r.y,
      toIdx: 2,
      line0: 0,
      line1: 1
    },
    {
      x: r.x + r.w,
      y: r.y + r.h,
      toIdx: 3,
      line0: 0,
      line1: 1
    },
    {
      x: r.x,
      y: r.y + r.h,
      toIdx: 0,
      line0: 0,
      line1: 1
    }
  ];
  dots = dots.concat(genExtraDots(dots)).map((value => {
    const tan_a = Math.tan(skewX * Math.PI / 180);
    const tan_b = Math.tan(skewY * Math.PI / 180);
    const {x, y} = value;
    value.origX = x;
    value.origY = y;
    value.y = x * tan_b + y - tan_b * r.h;
    value.x = x + y * tan_a - tan_a * r.w;
    value.y = x * tan_b + y - tan_b * r.h;
    return value;
  }));

  // Generate lines
  dots
    .filter(a => a.toIdx !== undefined)
    .forEach((point, i) => {
      const adding = isAdd ? RN(10, maxValue) : 0;
      const { x, y, toIdx } = point;
      const { x: x1, y: y1 } = dots[toIdx === undefined ? 0 : toIdx];
      const angle = Math.atan2(y1 - y, x1 - x);
      // const isCur = RN(1, 2) === 1;

      lines.push([
        x - (adding * Math.cos(angle)),
        y - (adding * Math.sin(angle)),
        // ((x - (adding * Math.cos(angle))) + (x1 + (adding * Math.cos(angle)))) / 2 + (isCur ? RN(-50, 50) : 0),
        // ((y - (adding * Math.sin(angle))) + (y1 + (adding * Math.sin(angle)))) / 2 + (isCur ? RN(-50, 50) : 0),

        x1 + (adding * Math.cos(angle)),
        y1 + (adding * Math.sin(angle))
      ]);
    });

  // Generate curves
  const curves: any[] = [];
  // Generate curves
  new Array(RN(1, 2)).fill(true).forEach((_, z) => {
    // TODO Check correct
    const isHorizontal = RN(1, 2) === 1;
    const v1x = isHorizontal ? RN(0, 100) : RN(0, 500);
    const v1y = isHorizontal ? RN(0, 500) : RN(0, 100);
    const v1x0 = RN(200, 300);
    const v1y0 = RN(200, 300);
    const v2x = isHorizontal ? RN(400, 500) : RN(0, 500);
    const v2y = isHorizontal ? RN(0, 500) : RN(400, 500);

    const gen_curve = [v1x, v1y, v1x0, v1y0, v1x0, v1y0, v2x, v2y];
    const curve = new Bezier(...gen_curve);

    curves.push(curve);
  })

  // DETECT-POLYGONS(Ψ)
  // 1 G ← COMPUTE-INDUCED-GRAPH(Ψ)
  // 2 Γ ← MINIMUM-CYCLE-BASIS(G)
  // 3 Θ ← POLYGONS-FROM-CYCLES(Γ)

  // 0. Find intersection
  const _lines = lines.map((a, i) => { return {from: {x:  a[0], y:  a[1]}, to:   {x: a[2], y: a[3]}, i: i}; });
  const detectIntersections = isect.sweep(_lines, {});
  const intersections = detectIntersections.run().map((a, i) => { return {...a, index: i}; });

  // Add intersection curves
  const curve_intersections: any = [];

  // curve-curve intersection
  curves.forEach((curve, curveIndex1) => {
    curves.filter(curve2 => curve2 !== curve).forEach((curve2, curveIndex2) => {
      curve.intersects(curve2).forEach(pair => {
        const t = pair.split("/").map(v => parseFloat(v));
        const point =  curve.get(t[0]);
        curve_intersections.push({
          index: intersections.length + curve_intersections.length,
          point: { x: point.x, y: point.y },
          t: t,
          segments: [
            {
              i: lines.length + curveIndex1,
            },
            {
              i: lines.length + curveIndex2,
            },
          ]
        })
      });
    })
  })

  // curve-line intersection
  lines.forEach((l, lineIndex) => {
    const line = { p1: { x: l[0], y: l[1] }, p2: { x: l[2], y: l[3] } };
    curves.forEach((curve, curveIndex) => {
      curve.intersects(line).forEach(t => {
        const point = curve.get(t);
        curve_intersections.push({
          index: intersections.length + curve_intersections.length,
          point: { x: point.x, y: point.y },
          t: t,
          segments: [
            {
              i: lineIndex,
            },
            {
              i: lines.length + curveIndex,
            },
          ]
        })
      });
    })
  });
  curve_intersections.forEach(curve => {
    intersections.push(curve);
  });

  // 1. Create graph
  // COMPUTE- INDUCED-GRAPH, computes the graph G induced by set Φ in O((N+M)logN)
  // The first step of our approach consists in detecting all M intersections between N line segments in a plane.
  const graph =  new Graph();
  intersections.forEach((inter, i) => {
    graph.addVertex(i);
  });
  const distance: any = {};
  intersections.forEach((inter, i) => {
    inter.segments.forEach(seg => {
      let r = 0;
      let minId = '';
      let ids = 0;
      intersections
        .filter((a, z) => z !== i && a.segments.map(y => y.i).includes(seg.i))
        .forEach(int => {
          const dist = Math.hypot(inter.point.x - int.point.x, inter.point.y - int.point.y);
          if (dist < r || r === 0) {
            r = dist;
            minId = `${i}_${int.index}`;
            ids = int.index;
          }
        });
      graph.addEdge(i, ids, r);
      graph.addEdge(ids, i, r);
      distance[minId] = r;
    });
  });

  // 2. Get cycles in an undirected graph
  const bases: number[][] = [];
  const hack = Object.keys(graph.vertices).length + 1;
  Object.keys(graph.vertices).map(a => parseInt(a)).forEach(a => {
    // MIN CYCLE
    const N = 10000;
    const graph1: any[] = new Array(N).fill(Boolean).map(a => []);
    const cycles: any[] = new Array(N).fill(Boolean).map(a => []);

    const addEdge = (u, v) => {
      graph1[u].push(v);
      graph1[v].push(u);
    };

    const index = a;
    if (!graph.vertices[index]) {
      return;
    }
    const vert = graph.vertices[index];
    const edg: any[] = [];
    const eedges = Object.keys(vert.edges).map(a => parseInt(a));

    // TODO Optimization
    eedges.forEach(edge => {
      edg.push([index, edge]);
      Object.keys(graph.vertices[edge].edges).map(a => parseInt(a)).forEach(edge2 => {
        edg.push([edge, edge2]);
      });
    });
    eedges.forEach(edge => {
      Object.keys(graph.vertices[edge].edges).map(a => parseInt(a)).forEach(edge2 => {
        edg.push([edge, edge2]);
      });
    });
    edg.forEach(e => {
      addEdge(e[0] === 0 ? hack : e[0], e[1] === 0 ? hack : e[1]);
    });

    const color = new Array(N).fill(Boolean).map(a => 0);
    const par = new Array(N).fill(Boolean).map(a => 0);
    /// mark with unique numbers
    const mark = new Array(N).fill(Boolean).map(a => 0);

    // store the numbers of cycle
    let cyclenumber = 0;
    const edges = 100;

    const dfs_cycle = (u, p, color, mark, par) => {
      if (color[u] === 2) {
        return;
      }
      // seen vertex, but was not
      // completely visited -> cycle detected.
      // backtrack based on parents to
      // find the complete cycle.
      if (color[u] === 1) {
        cyclenumber += 1;
        let cur = p;
        mark[cur] = cyclenumber;

        while (cur !== u) {
          cur = par[cur];
          mark[cur] = cyclenumber;
        }
        return;
      }
      par[u] = p;
      color[u] = 1;
      for (const va in graph1[u]) {
        const v = graph1[u][parseInt(va)];
        if (v === par[u]) {
          continue;
        }
        dfs_cycle(v, u, color, mark, par);
      }
      color[u] = 2;
    };

    dfs_cycle(index, a, color, mark, par);

    for (let i = 1; i < edges + 1; i++) {
      if (mark[i] !== 0) {
        cycles[mark[i]].push(i);
      }
    }
    for (let i = 1; i < cyclenumber + 1; i++) {
      if (cycles[i].length >= 3) {
        const value = cycles[i].flat().map(b => b === hack ? 0 : b);
        if (!bases.map(b => b.join()).includes(value.join())) {
          bases.push(value);
        }
      }
    }
  });

  // 3. Constructs a set of polygon, sort clockwise
  const polygons: number[][] = [];
  const paths: PathData[][] = [];
  bases.forEach(base => {
    const points = base.map(a => {
      return {
        x: intersections[a].point.x,
        y: intersections[a].point.y,
        t: intersections[a].t,
        angle: 0,
        idx: a,
        segments: intersections[a].segments.map(a => a.i),
        isPath: intersections[a].segments.map(a => a.i).flat().some(a => a >= lines.length)
      };
    });
    // Check is not contains curves
    const isPath = points.some(a => a.isPath);
    const center = points.reduce((acc, { x, y }) => {
      acc.x += x / points.length;
      acc.y += y / points.length;
      return acc;
    }, { x: 0, y: 0 });

    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(({ x, y, segments, idx, t }) => {
      return { x, y, idx, t, segments, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);

    if(!isPath) {
      polygons.push(pointsSorted.map(a => [a.x, a.y]).flat());
    } else {
      const path: PathData[] = [];
      pointsSorted.forEach((point, index) => {
        const next_point = pointsSorted[index >= pointsSorted.length-1 ? 0 : index+1];
        if(index === 0){
          path.push({command: 'M', points: [point.x, point.y]});
        }
        if(point.t && next_point.t){
          const curveIndex = next_point.segments.filter(a => point.segments.includes(a))[0];
          if(curveIndex >= lines.length){

            const new_curve = curves[curveIndex - lines.length].split(point.t, next_point.t);
            const crts = new_curve.points.map(a => [a.x, a.y]).flat();
            if(!crts.some(a => isNaN(a))){

              path.push({command: 'M', points: [crts[0], crts[1]]});
              path.push({command: 'C', points: [crts[2], crts[3], crts[4], crts[5], crts[6], crts[7]]});
            }
          } else {
            path.push({command: 'L', points: [point.x, point.y]});
          }
        } else {
          path.push({command: 'L', points: [next_point.x, next_point.y]});
        }
      });
      paths.push(path);
    }
  });

  const result_curves = curves.map(curve => {
    return curve.points.map(a => [a.x, a.y]).flat()
  });

  return {
    lines: lines,
    curves: result_curves,
    polygons: polygons,
    paths: paths,
  };
};

const classicGenerator = (width: number, height: number): GeneratorData => {
  const polygons: number[][] = [];
  const lines: number[][] = [];

  const grid = () => {
    // TODO Set config, size
    const col = Math.floor((width) / Math.floor(width / 100 * 15));
    const row = Math.floor((height) / Math.floor(height / 100 * 15));

    const matrix = Array(row).fill(0).map(() => Array(col).fill(0));
    let curRow = 0;
    let curCol = 0;
    let maxRows = row;
    let maxColumns = col;

    const grid: any[] = [];

    while (curRow < row) {
      const rowSpan = Math.floor(Math.random() * maxRows + 1);
      const columnSpan = Math.floor(Math.random() * maxColumns + 1);

      grid.push({
        x: (curRow / row * width),
        y: (curCol / col * height),
        width: ((((curRow + rowSpan)) / row * width) - curRow / row * width), // - border,
        height: ((((curCol + columnSpan)) / col * height) - curCol / col * height) // - border
      });

      for (let i = curRow; i < curRow + rowSpan; i++) {
        for (let j = curCol; j < curCol + columnSpan; j++) {
          matrix[i][j] = 1;
        }
      }
      if (curCol + columnSpan >= col) {
        curRow++;
        curCol = 0;
      } else {
        curCol += columnSpan;
      }

      if (curRow >= row) {
        return grid;
      }

      while (matrix[curRow][curCol] === 1) {
        curCol = curCol + 1;
        if (curCol >= col) {
          curRow++;
          curCol = 0;
        }

        if (curRow >= row) {
          return grid;
        }
      }
      for (let i = curRow; i < row; i++) {
        if (matrix[i][curCol] === 0) {
          maxRows = i - curRow + 1;
        } else {
          break;
        }
      }
      for (let j = curCol; j < col; j++) {
        if (matrix[curRow][j] === 0) {
          maxColumns = j - curCol + 1;
        } else {
          break;
        }
      }
    }
    return grid;
  };
  const items = grid();

  items.forEach(rect => {
    polygons.push([
      rect.x, rect.y, rect.x + rect.width, rect.y,
      rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height
    ]);
    lines.push([rect.x, rect.y, rect.x + rect.width, rect.y]);
    lines.push([rect.x + rect.width, rect.y + rect.height, rect.x + rect.width, rect.y]);
  });

  return {
    lines: lines,
    polygons: polygons,
    curves: [],
    paths: [],
  };
};
