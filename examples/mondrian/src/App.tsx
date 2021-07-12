import React, {useCallback, useEffect, useRef, useState} from 'react';
import {folder, useControls} from "leva"
import './App.css';
import Mondrian from "../../../src/index";
import {IMondrian, MondrianArtConfig} from "../../../src/types";

function App() {
  const refInfo = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [mondrian, setMondrian] = useState<IMondrian>();
  const { width, height, enableAnimation } = useControls({
    width: 500,
    height: 500,
    enableAnimation: {
      value: false,
      label: "animation",
    },
  });
  const { style, enableGradient, enableSnaking, backgroundColor, color1, color2, color3, lineWidth, title } =
    useControls("Mondrian",
    {
      style: {
        value: "neo",
        options: ["random", "neo", "classic"]
      },
      "Palette": folder(
        {
          color1: {
            value: "#0e448c",
            label: "color #1"
          },
          color2: {
            value: "#f61710",
            label: "color #2"
          },
          color3: {
            value: "#ffd313",
            label: "color #3"
          },
        },
        {
          collapsed: false,
        }
      ),
      lineWidth: {
        value: 1,
        step: 0.1,
        label: "line width",
        hint: "Set '0' for random width",
      },
      enableGradient: {
        value: true,
        label: 'gradient'
      },
      enableSnaking: {
        value: false,
        label: 'snaking'
      },
      backgroundColor: {
        value: "#fff",
        label: "background"
      },
      title: {
        value: "",
        label: "Title",
        hint: "Example: Piet Mondrian"
      }
    }
  ) as {
    style: "neo" | "classic" | "random",
    backgroundColor?: string,
    enableGradient?: boolean,
    enableSnaking?: boolean,
    color1: string, color2: string, color3: string, lineWidth?: number, title?: string,
  };

  const generateConfig = (): MondrianArtConfig => {
    return {
      width,
      height,
      container: refInfo.current,
      enableAnimation,
      mondrian: {
        palette: [color1, color2, color3,],// 'transparent', 'transparent'
        style,
        enableGradient,
        enableSnaking,
        lineWidth: lineWidth === 0 ? "random" : lineWidth,
        title,
        backgroundColor,
      }
    }
  }

  useEffect(() => {
    if(refInfo.current){
      const mon = new Mondrian(generateConfig())
      mon.generate();
      setMondrian(mon);
    }
  }, []);

  useEffect(() => {
    if(refInfo.current){
      mondrian?.reconfigure(generateConfig());
      mondrian?.generate();
    }
  }, [
    width, height, enableSnaking, enableAnimation, enableGradient, style,
    backgroundColor, color1, color2, color3, lineWidth, title,
  ]);

  const escFunction = useCallback((event) => {
    if(event.keyCode === 32) {
      event.preventDefault();
      event.stopPropagation();
      console.log("mondrian", mondrian)
      mondrian?.generate();
    }
  }, []);

  useEffect(() => {
    if(mondrian){
      mondrian.generate();
    }
  }, [active])

  return (
    <div
      style={{
        width: window.innerWidth,
        height: window.innerHeight,
      }}
      className="App">
      <div
        onClick={() => {setActive(!active)}}
        style={{
          // width: 500,
          // height: 500,
          userSelect: "none",
        }}
        ref={refInfo} />

      {/*<svg width={500} height={500} viewBox={'0 0 500 500'}>*/}
      {/*  <path d={'M 327.5 85.5 C 265.4  232.9  265.4  232.9  321  452.2 L 120 120Z'} fill={'black'} stroke={'red'} strokeWidth={1}/>*/}
      {/*</svg>*/}
    </div>
  );
}

export default App;
