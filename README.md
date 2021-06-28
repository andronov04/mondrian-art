# Mondrian Art Generator
> De Stijl was founded in 1917 by two pioneers of abstract art, **Piet Mondrian** and Theo van Doesburg. De Stijl means style in Dutch.

![Mondrian](https://firebasestorage.googleapis.com/v0/b/toolgraphics.appspot.com/o/github%2Fgithub-mondrian.jpg?alt=media&token=af155b73-01b9-4336-8300-7f4d7de50f5c "Mondrian Art Generator")

## Demo
[🖼️ tool.graphics/mondrian](https://tool.graphics/mondrian)

Generate Piet Mondrian Art. There's an endless number of options.

## Control

- Thousands of beautiful color schemes.
- Custom background color of the picture.
- Any size of the picture.
- Static or dynamic mode.
- Jitter effect.
- Use gradient for polygons.

## Install

```
$ npm install modrian-art
or
$ yarn add modrian-art
```

## Usage
```
import Mondrian from 'mondrian-art';

const config = {
    width, // Default, 500
    height, // Default, 500
    container: document.querySelector("section"), // Set DOM Node 
    enableAnimation, // Default, true. Option `false` for static.
    mondrian: {
      palette: [color1, color2, color3, 'transparent', 'transparent', 'transparent'], Default, ['#0e448c', '#f61710', '#ffd313', 'transparent',  'transparent'].
      style, // Default, `random`. Options: `random`, `neo`, `classic`.
      enableGradient, // Default, false. 
      enableSnaking, // Default, false. Jitter effect
      lineWidth: 1, // Default, 1. Options: `random`, 1, 2.5, 5 or any number
      title, // The sign of a picture. Example `Piet Mondrian`.
      backgroundColor, // Default, #fff.
    }
 }

const mondrian = new Mondrian(config);

// Generate
mondrian.generate();

// Reconfigure
mondrian.reconfigure(config);

// Restart animaton
mondrian.play();
```
## Run locally
[See docs](https://github.com/andronov04/mondrian-art/blob/main/examples/mondrian/README.md)

## Maintainers

- [Andrey Andronov](https://github.com/andronov04)

### License

MIT, see [LICENSE](https://github.com/andronov04/mondrian-art/blob/main/LICENSE) for details.
