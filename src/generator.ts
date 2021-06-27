import { shuffle } from "lodash";
import tinycolor from "tinycolor2";
import {Graph} from "./graph";
import {MondrianArtConfig, GeneratorData, Item, ItemType, TPoint} from "./types";
import {RN} from "./utils";
import {gradient} from "./styling";

const isect = require('isect');

export default (config: MondrianArtConfig): Item[] => {
  const width = config.width || 500;
  const height = config.height || 500;
  let style = config.mondrian?.style || "random";
  const lineWidth = config.mondrian?.lineWidth || 1;
  const enableAnimation = config.enableAnimation || true;
  const backgroundColor = config.mondrian?.backgroundColor || "#fff";
  const enableGradient = config.mondrian?.enableGradient || false;
  const palette = config.mondrian?.palette || ['#0e448c', '#f61710', '#fff', '#ffd313', '#fff', '#fff'];

  if(style === "random"){
    style = shuffle(["neo", "classic"])[0];
  }

  // 1. Generate lines and polygons (rects). Default it's random
  let data;
  if(style === "classic"){
    // Classic generator
    data = classicGenerator(width, height);
  }
  if(style === "neo"){
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
      fill:  tinycolor.isReadable(backgroundColor, "#fff") ? "#fff" : "#000",
      strokeWidth: lineWidth === "random" ? RN(0.5, 4) : lineWidth,
      target: null,
    });
  });
  // Style polygons
  data.polygons.forEach(polygon => {
    items.push({
      type: ItemType.polygon,
      points: polygon,
      gradient: enableGradient ? gradient(shuffle(palette)[0]) : undefined,
      fill: shuffle(palette)[0],
      target: null,
    });
  });

  // 3. Generate animation, if enabled
  if(enableAnimation){

  }

  return items;
}

const neoGenerator = (width: number, height: number): GeneratorData => {
  const w = RN(50, width - 100); // TODO Percent max available
  const h = RN(50, height - 80);
  const r = {
    x: (width - w) / 2,
    y: (height - h) / 2,
    w: w,
    h: h,
  };
  const lines: number[][] = [];
  const skew = RN(1, 5) === 1;
  const skewX = skew ? RN(-20, 20) : 0;
  const skewY = skew ? RN(-20, 20) : 0;

  const genExtraDots = (points: TPoint[]): TPoint[] => {
    const extra_points: TPoint[] = [];
    points.slice(0, 2).forEach((point, i) => {
      const dot1 = RN(-100, 100);
      const dot2 = RN(-100, 100);

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
          line1: 1,
        },
        {
          x: ((x + x1) / 2) - dot2 * Math.cos(angle),
          y: ((y + y1) / 2) - dot2 * Math.sin(angle),
          line0: 0,
          line1: 1,
        },
      ]);
      if(i === RN(1, 2)){
        extra_points.push(...[
          {
            x: ((x2 + x21) / 2) - 60 * Math.cos(angle2), //RN(-100, 100)
            y: ((y2 + y21) / 2) - 60 * Math.sin(angle2),
            toIdx: points.length + extra_points.length + 1,
            line0: 0,
            line1: 1,
          },
          {
            x: ((x + x1) / 2) - -60 * Math.cos(angle),
            y: ((y + y1) / 2) - -60 * Math.sin(angle),
            line0: 0,
            line1: 1,
          },
        ]);
      }
    })
    return extra_points;
  }
  let dots: TPoint[] = [
    {
      x: r.x,
      y: r.x,
      toIdx: 1,
      line0: 0,
      line1: 1,
    },
    {
      x: r.x + r.w,
      y: r.y,
      toIdx: 2,
      line0: 0,
      line1: 1,
    },
    {
      x: r.x + r.w,
      y: r.y + r.h,
      toIdx: 3,
      line0: 0,
      line1: 1,
    },
    {
      x: r.x,
      y: r.y + r.h,
      toIdx: 0,
      line0: 0,
      line1: 1,
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
    return value
  }));

  // Generate lines
  dots
    .filter(a => a.toIdx !== undefined)
    .forEach((point, i) => {
      const adding = RN(40, 120);
      const { x, y, toIdx } = point;
      const { x: x1, y: y1 } = dots[toIdx === undefined ? 0 : toIdx];
      const angle = Math.atan2(y1 - y, x1 - x)
      // const isCur = RN(1, 2) === 1;

      lines.push([
        x - (adding * Math.cos(angle)),
        y - (adding * Math.sin(angle)),
        // ((x - (adding * Math.cos(angle))) + (x1 + (adding * Math.cos(angle)))) / 2 + (isCur ? RN(-50, 50) : 0),
        // ((y - (adding * Math.sin(angle))) + (y1 + (adding * Math.sin(angle)))) / 2 + (isCur ? RN(-50, 50) : 0),

        x1 + (adding * Math.cos(angle)),
        y1 + (adding * Math.sin(angle)),
      ]);
    });

  // DETECT-POLYGONS(Ψ)
  // 1 G ← COMPUTE-INDUCED-GRAPH(Ψ)
  // 2 Γ ← MINIMUM-CYCLE-BASIS(G)
  // 3 Θ ← POLYGONS-FROM-CYCLES(Γ)

  // 0. Find intersection
  const _lines = lines.map((a, i) => { return {from: {x:  a[0], y:  a[1]}, to:   {x: a[2], y: a[3]}, i: i}});
  const detectIntersections = isect.sweep(_lines, {});
  const intersections = detectIntersections.run().map((a, i) => { return {...a, index: i} });

  // 1. Create graph
  // COMPUTE- INDUCED-GRAPH, computes the graph G induced by set Φ in O((N+M)logN)
  // The first step of our approach consists in detecting all M intersections between N line segments in a plane.
  const graph =  new Graph();
  intersections.forEach((inter, i) => {
    graph.addVertex(i);
  })
  const distance: any = {};
  intersections.forEach((inter, i) => {
    inter.segments.forEach(seg => {
      let r = 0;
      let minId = "";
      let ids = 0;
      intersections
        .filter((a, z) => z !== i && a.segments.map(y => y.i).includes(seg.i))
        .forEach(int => {
          const dist = Math.hypot(inter.point.x - int.point.x, inter.point.y - int.point.y)
          if(dist < r || r === 0){
            r = dist;
            minId = `${i}_${int.index}`
            ids = int.index
          }
        })
      graph.addEdge(i, ids, r);
      graph.addEdge(ids, i, r);
      distance[minId] = r;
    })
  });

  // 2. Get cycles in an undirected graph
  const bases: number[][] = [];
  const hack = Object.keys(graph.vertices).length + 1;
  Object.keys(graph.vertices).map(a => parseInt(a)).forEach(a => {
    // MIN CYCLE
    const N = 1000
    const graph1: any[] = new Array(N).fill(Boolean).map(a => []);
    const cycles: any[] = new Array(N).fill(Boolean).map(a => []);

    const addEdge = (u, v) => {
      graph1[u].push(v)
      graph1[v].push(u)
    }

    const index = a;
    if(!graph.vertices[index]){
      return
    }
    const vert = graph.vertices[index];
    const edg: any[] = []
    const eedges = Object.keys(vert.edges).map(a => parseInt(a));

    // TODO Optimization
    eedges.forEach(edge => {
      edg.push([index, edge])
      Object.keys(graph.vertices[edge].edges).map(a => parseInt(a)).forEach(edge2 => {
        edg.push([edge, edge2])
      })
    })
    eedges.forEach(edge => {
      Object.keys(graph.vertices[edge].edges).map(a => parseInt(a)).forEach(edge2 => {
        edg.push([edge, edge2])
      })
    })
    edg.forEach(e => {
      addEdge(e[0] === 0 ? hack : e[0], e[1] === 0 ? hack : e[1])
    })
    // console.log("graph", graph1.slice(0, 10))

    const color = new Array(N).fill(Boolean).map(a => 0);
    const par = new Array(N).fill(Boolean).map(a => 0);
    /// mark with unique numbers
    const mark = new Array(N).fill(Boolean).map(a => 0);

    // store the numbers of cycle
    let cyclenumber = 0
    const edges = 23

    const dfs_cycle = (u, p, color, mark, par) => {
      if (color[u] == 2){
        return
      }
      // seen vertex, but was not
      // completely visited -> cycle detected.
      // backtrack based on parents to
      // find the complete cycle.
      if(color[u] == 1){
        cyclenumber += 1;
        let cur = p;
        mark[cur] = cyclenumber;

        while (cur != u){
          cur = par[cur]
          mark[cur] = cyclenumber
        }
        return;
      }
      par[u] = p;
      color[u] = 1;
      for (const va in graph1[u]) {
        const v = graph1[u][parseInt(va)];
        if (v == par[u]){
          continue
        }
        dfs_cycle(v, u, color, mark, par)
      }
      color[u] = 2
    }

    dfs_cycle(index, 0, color, mark, par);

    for (let i = 1; i < edges + 1; i++) {
      if (mark[i] != 0){
        cycles[mark[i]].push(i)
      }
    }
    for (let i = 1; i < cyclenumber + 1; i++) {
      if(cycles[i].length >= 3){
        const value = cycles[i].flat().map(b => b === hack ? 0 : b);
        if(!bases.map(b => b.join()).includes(value.join())){
          bases.push(value)
        }
      }
    }
  })

  // 3. Constructs a set of polygon, sort clockwise
  const polygons: number[][] = [];
  bases.forEach(base => {
    const points = base.map(a => { return {
      x: intersections[a].point.x,
      y: intersections[a].point.y,
      angle: 0,
    } });
    const center = points.reduce((acc, { x, y }) => {
      acc.x += x / points.length;
      acc.y += y / points.length;
      return acc;
    }, { x: 0, y: 0 });

    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(({ x, y }) => {
      return { x, y, angle: Math.atan2(y - center.y, x - center.x) * 180 / Math.PI };
    });

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.angle - b.angle);
    polygons.push(pointsSorted.map(a => [a.x, a.y]).flat())
  })

  return {
    lines,
    polygons,
  }
}

const classicGenerator = (width: number, height: number): GeneratorData => {
  const polygons: number[][] = [];
  const lines: number[][] = [];

  const grid = () => {
    // TODO Set config, size
    const col = Math.floor((width) / 70);
    const row = Math.floor((height) / 70);

    const matrix = Array(row).fill(0).map(() => Array(col).fill(0))
    let curRow = 0, curCol = 0
    let maxRows = row
    let maxColumns = col

    const grid: any[] = []

    while (curRow < row) {
      const rowSpan = Math.floor(Math.random() * maxRows + 1)
      const columnSpan = Math.floor(Math.random() * maxColumns + 1)

      grid.push({
        x: (curRow / row * width),
        y: (curCol / col * height),
        width: ((((curRow + rowSpan)) / row * width) - curRow / row * width),// - border,
        height: ((((curCol + columnSpan)) / col * height) - curCol / col * height),// - border
      })

      for (let i = curRow; i < curRow + rowSpan; i++) {
        for (let j = curCol; j < curCol + columnSpan; j++) {
          matrix[i][j] = 1
        }
      }
      if (curCol + columnSpan >= col) {
        curRow++
        curCol = 0
      } else {
        curCol += columnSpan
      }

      if (curRow >= row){
        return grid
      }

      while (matrix[curRow][curCol] === 1) {
        curCol = curCol + 1
        if (curCol >= col) {
          curRow++
          curCol = 0
        }

        if (curRow >= row){
          return grid
        }
      }
      for (let i = curRow; i < row; i++) {
        if (matrix[i][curCol] === 0)
          maxRows = i - curRow + 1
        else
          break
      }
      for (let j = curCol; j < col; j++) {
        if (matrix[curRow][j] === 0)
          maxColumns = j - curCol + 1
        else
          break
      }
    }
    return grid
  }
  const items = grid();

  items.forEach(rect => {
    polygons.push([
      rect.x, rect.y, rect.x + rect.width, rect.y,
      rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height
    ])
    lines.push([rect.x, rect.y, rect.x + rect.width, rect.y])
    lines.push([rect.x + rect.width, rect.y + rect.height,rect.x + rect.width, rect.y])
  })

  return {
    lines: lines,
    polygons: polygons,
  }
}
