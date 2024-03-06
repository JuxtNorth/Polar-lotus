import EffectPass from '../EffectPass';
import { type GLContext, WebGLShaderProgram, WebGLFrameBuffer } from '@/WebGL';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from './Shader/overlay.frag.glsl?raw';
import { BloomPrePass, BloomBlurPass, BloomFinalPass } from '@/PostProcessing';

export interface BloomConfig {
	intensity?: number;
	threshold?: number;
}

type BloomPasses = [BloomPrePass, BloomBlurPass, BloomFinalPass];

export class BloomPass extends EffectPass {
	private fbo?: WebGLFrameBuffer;
	private program?: WebGLShaderProgram;
	private passes: BloomPasses;

	public _intensity = 0.8;
	public _threshold = 0.3;

	constructor(config: BloomConfig = {}) {
		super();
		const { intensity, threshold } = config;
		if (intensity) this.intensity = intensity;
		if (threshold) this.threshold = threshold;
		this.passes = [
			new BloomPrePass(this.threshold),
			new BloomBlurPass(),
			new BloomFinalPass(this.intensity)
		] as BloomPasses;
	}

	set intensity(value: number) {
		this.passes![2].intensity = value;
		this._intensity = value;
	}

	get intensity() {
		return this._intensity;
	}

	set threshold(value: number) {
		this.passes![0].threshold = value;
		this._threshold = value;
	}

	get threshold() {
		return this._threshold;
	}

	setup(gl: GLContext) {
		this.passes.forEach((pass) => pass.setup(gl));
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		});
		this.program.initUniforms({});
		this.initFrameBuffer(gl);
	}

	initFrameBuffer(gl: GLContext) {
		this.fbo = new WebGLFrameBuffer(gl);
		this.passes.forEach((pass) => pass.initFrameBuffer(gl));
	}

	render(gl: GLContext, texture: WebGLTexture): WebGLTexture {
		if (!this.fbo || !this.program) {
			throw new Error('EffectPass not set up');
		}

		const { fbo, passes, program } = this;

		let tex = texture;

		tex = passes![0].render(gl, tex);
		tex = passes![1].render(gl, tex);
		tex = passes![2].render(gl, tex);

		// Overlay
		fbo.bind(gl);
		program.bind();

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex);

		program.setUniform('uTexture', { value: 0 });
		program.setUniform('uBloom', { value: 1 });

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		program.unbind();
		fbo.unbind(gl);

		return fbo.texture;
	}
}
