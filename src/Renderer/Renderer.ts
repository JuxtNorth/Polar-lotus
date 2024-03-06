import {
	type GLContext,
	type GLShaderSrc,
	type UniformValue,
	WebGLShaderProgram,
	WebGLFrameBuffer
} from '@/WebGL';
import { Canvas } from './Canvas';
import { type EffectComposer } from '@/PostProcessing';
import vs from '../Shader/lotus.vert.glsl?raw';
import fs from '../Shader/lotus.frag.glsl?raw';
import type { Color } from '@/types';

export interface RendererConfig {
	rotation: UniformValue<number>;
	colorStop1: UniformValue<Color>;
	colorStop2: UniformValue<Color>;
}

export class Renderer extends Canvas {
	private gl?: GLContext;
	private shaderProgram: WebGLShaderProgram;
	private fbo?: WebGLFrameBuffer;
	private effectComposer?: EffectComposer;

	public config: {
		rotation: UniformValue<number>;
		colorStop1: UniformValue<Color>;
		colorStop2: UniformValue<Color>;
	};

	constructor(dom: HTMLCanvasElement, config: Partial<RendererConfig> = {}) {
		super(dom);

		this.config = {
			rotation: { value: 0.01 },
			colorStop1: { value: [1, 0, 0] },
			colorStop2: { value: [1, 0, 1] }
		};

		Object.assign(this.config, config);

		this.getGLContext();

		const gl = this.gl as GLContext;

		const shaders: GLShaderSrc = {
			vs: vs,
			fs: fs
		};

		this.shaderProgram = new WebGLShaderProgram(gl, shaders);

		this.initFrameBuffer(gl);

		this.init();

		super.setupResizeObserver(() => {
			this.shaderProgram.bind();
			this.shaderProgram.setUniform('uSize', { value: super.size });
			this.shaderProgram.unbind();
			if (this.effectComposer) {
				this.initFrameBuffer(gl);
				this.effectComposer.resizeFBOs(gl);
			}
		});
	}

	initFrameBuffer(gl: GLContext) {
		this.fbo = new WebGLFrameBuffer(gl);
	}

	init() {
		const quad = new Float32Array([
			1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0
		]);

		this.shaderProgram.initAttributes({
			a_position: { data: quad, components: 2 }
		});

		this.shaderProgram.initUniforms({
			uSize: { value: super.size },
			rotation: this.config.rotation,
			colorStop1: this.config.colorStop1,
			colorStop2: this.config.colorStop2
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
			this.fbo!.bind(gl);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			this.shaderProgram.unbind();
			this.effectComposer.render(gl, this.fbo!.texture);
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
