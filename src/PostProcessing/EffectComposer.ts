import type { GLContext } from '@/WebGL';
import EffectPass from './EffectPass';
import vs from "@/Shader/base.vert.glsl?raw"
import fs from "@/Shader/copy.frag.glsl?raw"
import { WebGLShaderProgram } from "@/WebGL"

/**
 * @class
 * @classdesc Manages and renders post processing effects.
 */
export class EffectComposer {
	passes: EffectPass[];
	ovp?: WebGLShaderProgram;

	constructor() {
		this.passes = [];
	}

	addPass(pass: EffectPass) {
		this.passes.push(pass);
	}

	setupPasses(gl: GLContext) {
		this.ovp = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		})
		this.ovp.initUniforms({})
		this.passes.forEach((pass) => pass.setup(gl));
	}

	render(gl: GLContext, texture: WebGLTexture) {
		let lastTexture = texture;
		this.passes.forEach((pass) => {
			lastTexture = pass.render(gl, lastTexture);
		});
		
		this.ovp.bind();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, lastTexture);
		
		this.ovp.setUniform(
			"uTexture", { value: 0 }
		)
		
		// Overlay 
/*		
		const p = this.ovp!;
		p.bind();
		p.setUniform("uTexture", { value: 0 })
		p.setUniform("uBloom", { value: 1 });
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, lastTexture);
*/
		const { width, height } = gl.canvas;
		gl.viewport(0, 0, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
/*		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null)
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, null);
*/
	}
}
