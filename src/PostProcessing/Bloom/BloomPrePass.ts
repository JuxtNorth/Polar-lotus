import type { GLContext } from '@/WebGL';
import EffectPass from '../EffectPass';
import { WebGLShaderProgram, WebGLFrameBuffer, UniformValue } from '@/WebGL';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from './Shader/pre.frag.glsl?raw';

type Curve = [number, number, number];

export class BloomPrePass extends EffectPass {
	private fbo?: WebGLFrameBuffer;
	private program?: WebGLShaderProgram;
	public uniforms: {
		texelSize: UniformValue<[number, number]>;
		threshold: UniformValue<number>;
		curve: UniformValue<Curve>;
	};

	constructor(threshold: number) {
		super();
		this.uniforms = {
			texelSize: { value: [0.0002, 0.0002] },
			threshold: { value: threshold },
			curve: { value: [0, 0, 0] }
		};
	}

	set threshold(value: number) {
		this.uniforms.threshold.value = value;
	}

	get threshold() {
		return this.uniforms.threshold.value;
	}

	get curve(): Curve {
		const { value } = this.uniforms.threshold;
		const knee = value * 0.7 + 0.0001;
		const x = value - knee;
		const y = knee * 2;
		const z = 0.25 / knee;
		return [x, y, z];
	}

	setup(gl: GLContext) {
		this.initFrameBuffer(gl);
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		});

		Object.assign(this.uniforms, {
			texelSize: { value: this.fbo!.texelSize },
			curve: { value: this.curve }
		});

		this.program.initUniforms(this.uniforms);
	}

	initFrameBuffer(gl: GLContext) {
		this.fbo = new WebGLFrameBuffer(gl);
	}

	render(gl: GLContext, texture: WebGLTexture): WebGLTexture {
		if (!this.fbo || !this.program) {
			throw new Error('EffectPass not set up');
		}

		this.fbo.bind(gl);
		this.program.bind();
		this.program.uploadUniforms();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		this.fbo.unbind(gl);

		return this.fbo.texture;
	}
}
