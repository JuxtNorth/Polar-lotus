import {
	type GLContext,
	type GLShaderSrc,
	WebGLShaderProgram,
	WebGLFrameBuffer
} from '@/WebGL';
import { Canvas } from './Canvas';
import { type EffectComposer } from '@/PostProcessing';
import vs from '../Shader/lotus.vert.glsl?raw';
import fs from '../Shader/lotus.frag.glsl?raw';

export class Renderer extends Canvas {
	private gl?: GLContext;
	private shaderProgram: WebGLShaderProgram;
	private fbo: WebGLFrameBuffer;
	private effectComposer?: EffectComposer;

	constructor(dom: HTMLCanvasElement) {
		super(dom);
		dom.id = 'renderer';
		this.getGLContext();

		const gl = this.gl as GLContext;

		const shaders: GLShaderSrc = {
			vs: vs,
			fs: fs
		};

		this.shaderProgram = new WebGLShaderProgram(gl, shaders);

		this.fbo = new WebGLFrameBuffer(gl);

		this.fbo.unbind(gl);

		this.init();
	}

	init() {
		const quad = new Float32Array([
			1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0
		]);

		this.shaderProgram.initAttributes({
			a_position: { data: quad, components: 2 }
		});

		this.shaderProgram.initUniforms({
			u_size: { value: super.size }
		});
	}

	setEffectComposer(composer: EffectComposer) {
		this.effectComposer = composer;
		this.effectComposer.setupPasses(this.gl as GLContext);
	}

	render() {
		const gl = this.gl as GLContext;

		this.shaderProgram.bind();
		this.shaderProgram.uploadUniforms();

		if (this.effectComposer) {
			// draw to an fbo instead of the backbuffer
			this.fbo.bind(gl);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			this.shaderProgram.unbind();
			this.effectComposer.render(gl, this.fbo.texture);
		} else {
			const { width, height } = gl.canvas;
			gl.viewport(0, 0, width, height);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		this.shaderProgram.unbind();
	}

	getGLContext() {
		const { dom } = this;
		let gl: GLContext | null;
		gl = dom.getContext('webgl2');
		if (gl === null) {
			gl = dom.getContext('webgl')!;
		}
		if (gl === null) {
			throw new Error('Unable to create a webgl context.');
		}
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.gl = gl as GLContext;
	}
}
