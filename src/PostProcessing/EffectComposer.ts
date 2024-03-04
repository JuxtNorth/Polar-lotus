import EffectPass from './EffectPass';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from '@/Shader/copy.frag.glsl?raw';
import { type GLContext, WebGLShaderProgram } from '@/WebGL';

/**
 * @class
 * @classdesc Manages and renders post processing effects.
 */
export class EffectComposer {
	passes: EffectPass[];
	program?: WebGLShaderProgram;

	constructor() {
		this.passes = [];
	}

	addPass(pass: EffectPass) {
		this.passes.push(pass);
	}

	setupPasses(gl: GLContext) {
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		});
		this.program.initUniforms({});
		this.passes.forEach((pass) => pass.setup(gl));
	}

	render(gl: GLContext, texture: WebGLTexture) {
		if (!this.program) {
			throw new Error('Effect Composer not set up');
		}

		let lastTexture = texture;
		this.passes.forEach((pass) => {
			lastTexture = pass.render(gl, lastTexture);
		});

		this.program.bind();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, lastTexture);

		this.program.setUniform('uTexture', { value: 0 });

		const { width, height } = gl.canvas;
		gl.viewport(0, 0, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
