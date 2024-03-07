# Polar Lotus Equation Renderer

A simple application written in typescript that uses webgl to render the [lotus equation](https://podcollective.com/polar-graph-art-quickgraph-a/lotus-equasion/). It also features a simple post processing system with an api similar to that of three.js

## Clone Repository

To clone this repository, use the following command:

```
git clone https://github.com/JuxtNorth/Polar-lotus.git
```

## Development Setup

1. Make sure you have Node.js and npm installed on your machine.
2. Navigate to the cloned repository directory.
3. Install dependencies by running:

```
pnpm install
```

4. Start the development server with:

```
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173` to view the application.

## About

This application is built using Vite. It leverages TypeScript for type safety and WebGL for rendering the polar lotus equation onto the screen. Additionally, post-processing blur and bloom effects are applied to enhance the visualization.

## Acknowledgements

The bloom shaders have been referenced from PavelDoGreat's impressive [fluid simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
The lotus equation has been referenced from [podcollective](https://podcollective.com/polar-graph-art-quickgraph-a/lotus-equasion/)

## TODO

1. Refactoring the WebGL wrapper classes.
2. Improving visuals.
3. Add a vignette post processing effect.
4. Adding other equations while also making the Renderer class flexible.
5. Making EffectComposer reuse FBOs in order to save memory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
