import EffectPass from '../EffectPass';
import { type GLContext, WebGLShaderProgram, WebGLFrameBuffer } from '@/WebGL';
import vs from '@/Shader/base.vert.glsl?raw';
import fs from './Shader/blur.frag.glsl?raw';

type Rect = [number, number];

function getResolution(gl: GLContext, resolution: number): Rect {
	let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;

	if (aspectRatio < 1) {
		aspectRatio = 1.0 / aspectRatio;
	}

	const min = Math.round(resolution);
	const max = Math.round(resolution * aspectRatio);

	if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
		return [max, min] as Rect;
	} else {
		return [min, max] as Rect;
	}
}

export class BloomBlurPass extends EffectPass {
	private fbos: WebGLFrameBuffer[] = [];
	private program?: WebGLShaderProgram;

	setup(gl: GLContext) {
		this.program = new WebGLShaderProgram(gl, {
			vs: vs,
			fs: fs
		});
		this.program.initUniforms({});
		this.initFrameBuffer(gl);
	}

	initFrameBuffer(gl: GLContext) {
		const samples = 16;
		const { fbos } = this;
		const res = getResolution(gl, 256);

		fbos.length = 0;

		const fbo = new WebGLFrameBuffer(gl, res);
		fbos.push(fbo);

		for (let i = 0; i < samples; i++) {
			const newRes: Rect = [res[0] >> (i + 1), res[1] >> (i + 1)];

			if (newRes[0] < 2 || newRes[1] < 2) break;

			fbos.push(new WebGLFrameBuffer(gl, newRes));
		}
	}

	render(gl: GLContext, texture: WebGLTexture): WebGLTexture {
		if (!this.fbos || !this.program) {
			throw new Error('EffectPass not set up');
		}

		const fbos = this.fbos!;
		const iters = fbos.length;
		let lastFBO = null;

		this.program.bind();
		this.program.uploadUniforms();

		for (let i = 0; i < iters; i++) {
			const destFBO = fbos[i];
			let source;

			if (lastFBO === null) {
				source = texture;
			} else {
				source = lastFBO.texture;
			}

			this.program.setUniform('texelSize', {
				value: destFBO.texelSize
			});

			destFBO.bind(gl);

			gl.bindTexture(gl.TEXTURE_2D, source);
			gl.viewport(0, 0, destFBO.sizeX, destFBO.sizeY);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			destFBO.unbind(gl);
			lastFBO = destFBO;
		}

		gl.blendFunc(gl.ONE, gl.ONE);
		gl.enable(gl.BLEND);

		for (let i = iters - 2; i >= 0; i--) {
			const destFBO = fbos[i];
			const source = lastFBO!.texture;

			this.program.setUniform('texelSize', {
				value: lastFBO!.texelSize
			});

			destFBO.bind(gl);

			gl.bindTexture(gl.TEXTURE_2D, source);
			gl.viewport(0, 0, destFBO.sizeX, destFBO.sizeY);
			gl.drawArrays(gl.TRIANGLES, 0, 6);

			destFBO.unbind(gl);

			lastFBO = destFBO;
		}

		gl.disable(gl.BLEND);

		return lastFBO!.texture;
	}
}
