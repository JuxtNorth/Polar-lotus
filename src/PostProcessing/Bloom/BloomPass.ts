import type { GLContext } from '@/WebGL';
import EffectPass from '../EffectPass';
import { WebGLShaderProgram, WebGLFrameBuffer } from '@/WebGL';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from './Shader/overlay.frag.glsl?raw';

import {
	BloomPrePass,
	BloomBlurPass,
	BloomFinalPass
} from "@/PostProcessing";

export class BloomPass extends EffectPass {
	private fbo?: WebGLFrameBuffer;
	private program?: WebGLShaderProgram;
	private passes: EffectPass[] = [];

	setup(gl: GLContext) {
		this.passes = [
			new BloomPrePass(),
			new BloomBlurPass(),
			new BloomFinalPass(),
		];
		this.passes.forEach(pass => pass.setup(gl));
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs,
		});
		this.program.initUniforms({});
		this.fbo = new WebGLFrameBuffer(gl);
	}

	render(gl: GLContext, texture: WebGLTexture): WebGLTexture {
		if (!this.fbo || !this.program) {
			throw new Error('EffectPass not set up');
		}
		
		const { fbo, passes, program } = this;

		let tex = texture;
		
		tex = passes[0].render(gl, tex);
		tex = passes[1].render(gl, tex);
		tex = passes[2].render(gl, tex);
		
		// Overlay 
		fbo.bind(gl);
		program.bind();
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		
		program.setUniform(
			"uTexture", { value: 0 }
		)
		program.setUniform(
			"uBloom", { value: 1 }
		)
		
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		program.unbind();
		fbo.unbind(gl);

		return fbo.texture;
	}
}
