import EffectPass from '../EffectPass';
import {
	type GLContext,
	WebGLShaderProgram,
	WebGLFrameBuffer,
	UniformValue
} from '@/WebGL';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from './Shader/final.frag.glsl?raw';

export class BloomFinalPass extends EffectPass {
	private fbo?: WebGLFrameBuffer;
	private program?: WebGLShaderProgram;
	public uniforms: {
		texelSize: UniformValue<[number, number]>;
		intensity: UniformValue<number>;
	};

	constructor(intensity: number) {
		super();
		this.uniforms = {
			texelSize: { value: [0.0002, 0.0002] },
			intensity: { value: intensity }
		};
	}

	set intensity(value: number) {
		this.uniforms.intensity.value = value;
	}

	get intensity() {
		return this.uniforms.intensity.value;
	}

	setup(gl: GLContext) {
		this.requiresUpdate = false;
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		});
		this.program.initUniforms(this.uniforms);
		this.initFrameBuffer(gl);
	}

	initFrameBuffer(gl: GLContext) {
		this.fbo = new WebGLFrameBuffer(gl);
		this.program!.bind();
		this.program!.setUniform('texelSize', { value: this.fbo.texelSize });
		this.program!.unbind();
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
