import type { GLContext } from '../types';
import EffectPass from './EffectPass';
import { WebGLShaderProgram, WebGLFrameBuffer } from '@/WebGL';

import baseVS from '@/Shader/base.vert.glsl?raw';

import preFS from '@/Shader/bloom/threshold.frag.glsl?raw';
import blurFS from '@/Shader/bloom/blur.frag.glsl?raw';
import finalFS from '@/Shader/bloom/final.frag.glsl?raw';
import overlayFS from '@/Shader/bloom/overlay.frag.glsl?raw';

interface Rect {
	width: number;
	height: number;
}

function getResolution(gl: GLContext, resolution: number): Rect {
	let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

	if (aspectRatio < 1) {
		aspectRatio = 1.0 / aspectRatio;
	}

	const min = Math.round(resolution);
	const max = Math.round(resolution * aspectRatio);

	if (gl.drawingBufferWidth > gl.drawingBufferHeight)
		return { width: max, height: min };
	else return { width: min, height: max };
}

export class BloomPass extends EffectPass {
	private blurFrameBuffers: Array<WebGLFrameBuffer> = [];
	private preFrameBuffer?: WebGLFrameBuffer;
	private finalFrameBuffer?: WebGLFrameBuffer;

	private preProgram?: WebGLShaderProgram;
	private blurProgram?: WebGLShaderProgram;
	private finalProgram?: WebGLShaderProgram;
	private overlayProgram?: WebGLShaderProgram;

	setup(gl: GLContext) {
		this.initFrameBuffers(gl);

		this.preProgram = new WebGLShaderProgram(gl, {
			vs: baseVS,
			fs: preFS
		});

		const thresh = 0.4;

		let knee = thresh * 0.7 + 0.0001;
		let curve = [thresh - knee, knee * 2, 0.25 / knee];

		this.preProgram.initUniforms({
			curve: { value: curve },
			threshold: { value: thresh }
		});

		this.blurProgram = new WebGLShaderProgram(gl, {
			vs: baseVS,
			fs: blurFS
		});

		this.blurProgram.initUniforms({
			texelSize: {
				value: this.preFrameBuffer!.texelSize
			}
		});

		this.finalProgram! = new WebGLShaderProgram(gl, {
			vs: baseVS,
			fs: finalFS
		});

		this.finalProgram!.initUniforms({
			texelSize: {
				value: this.preFrameBuffer!.texelSize
			},
			intensity: {
				value: 1.0
			}
		});

		this.overlayProgram = new WebGLShaderProgram(gl, {
			vs: baseVS,
			fs: overlayFS
		});

		this.overlayProgram.initUniforms({
			texelSize: {
				value: this.preFrameBuffer!.texelSize
			}
		});

		this.requiresUpdate = false;
	}

	initFrameBuffers(gl: GLContext, samples = 16) {
		this.preFrameBuffer = new WebGLFrameBuffer(gl);
		this.finalFrameBuffer = new WebGLFrameBuffer(gl);

		const { blurFrameBuffers } = this;
		const { width, height } = getResolution(gl, 256);

		const fbo = new WebGLFrameBuffer(gl, [width, height]);
		blurFrameBuffers.push(fbo);

		for (let i = 0; i < samples; i++) {
			const res: [number, number] = [width >> (i + 1), height >> (i + 1)];

			if (res[0] < 2 || res[1] < 2) break;

			const fbo = new WebGLFrameBuffer(gl, res);
			blurFrameBuffers.push(fbo);
		}
	}

	render(gl: GLContext, texture: WebGLTexture): WebGLTexture {
		if (this.requiresUpdate) {
			throw new Error('EffectPass requires to be set up before render call.');
		}

		let lastTexture = texture;
		let lastFBO = this.preFrameBuffer!;

		gl.disable(gl.BLEND);

		// Pre pass
		this.preFrameBuffer!.bind(gl);
		this.preProgram!.bind();
		this.preProgram!.uploadUniforms();
		gl.bindTexture(gl.TEXTURE_2D, lastTexture);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		this.preFrameBuffer!.unbind(gl);

		lastTexture = lastFBO.texture;

		// Progressively Blur Textures

		this.blurProgram!.bind();

		const blurFBOs = this.blurFrameBuffers!;

		const iters = blurFBOs.length; // Blur FBOs length

		for (let i = 0; i < iters; i++) {
			const destination = blurFBOs[i];
			const source = lastFBO;

			this.blurProgram!.setUniform('texelSize', {
				value: source.texelSize
			});

			destination.bind(gl);
			gl.bindTexture(gl.TEXTURE_2D, source.texture);
			gl.viewport(0, 0, destination.sizeX, destination.sizeY);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			destination.unbind(gl);
			lastFBO = destination;
		}

		gl.blendFunc(gl.ONE, gl.ONE);
		gl.enable(gl.BLEND);

		for (let i = iters - 2; i >= 0; i--) {
			const destination = blurFBOs[i];
			const source = lastFBO;
			this.blurProgram!.setUniform('texelSize', {
				value: source.texelSize
			});
			destination.bind(gl);
			gl.bindTexture(gl.TEXTURE_2D, source.texture);
			gl.viewport(0, 0, destination.sizeX, destination.sizeY);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			destination.unbind(gl);

			lastFBO = destination;
		}

		gl.disable(gl.BLEND);

		// Final Pass

		this.finalProgram!.bind();

		this.finalProgram!.uploadUniforms();

		const source = lastFBO;
		const destination = this.finalFrameBuffer!;

		destination.bind(gl);
		gl.bindTexture(gl.TEXTURE_2D, source.texture);
		gl.viewport(0, 0, destination.sizeX, destination.sizeY);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		destination.unbind(gl);

		// Overlay
		this.overlayProgram!.bind();
		this.overlayProgram!.uploadUniforms();

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, destination.texture);

		this.overlayProgram!.setUniform('uTexture', {
			value: 0
		});
		this.overlayProgram!.setUniform('uBloom', {
			value: 1
		});

		gl.viewport(0, 0, this.preFrameBuffer!.sizeX, this.preFrameBuffer!.sizeY);
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		return destination.texture;
	}
}
