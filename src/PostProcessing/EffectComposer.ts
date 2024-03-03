import type { GLContext } from '../types';
import EffectPass from './EffectPass';

/**
 * @class
 * @classdesc Manages and renders post processing effects.
 */
export class EffectComposer {
	passes: EffectPass[];

	constructor() {
		this.passes = [];
	}

	addPass(pass: EffectPass) {
		this.passes.push(pass);
	}

	setupPasses(gl: GLContext) {
		this.passes.forEach((pass) => pass.setup(gl));
	}

	render(gl: GLContext, texture: WebGLTexture) {
		let lastTexture = texture;
		this.passes.forEach((pass) => {
			lastTexture = pass.render(gl, lastTexture);
		});

		// Finally Draw to back buffer (screen)
		gl.bindTexture(gl.TEXTURE_2D, lastTexture);

		const { width, height } = gl.canvas;
		gl.viewport(0, 0, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
