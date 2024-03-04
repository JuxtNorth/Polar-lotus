import { GLContext } from '@/WebGL';
import { WebGLDebugger } from './Utils';

export class WebGLFrameBuffer {
	public frameBuffer: WebGLFramebuffer;
	public texture: WebGLTexture;
	public texelSizeX: number;
	public texelSizeY: number;
	public sizeX: number;
	public sizeY: number;

	constructor(gl: GLContext, size?: [number, number], level = 0) {
		const sizeRect = [
			size ? size[0] : gl.canvas.width,
			size ? size[1] : gl.canvas.height
		];

		this.sizeX = sizeRect[0];
		this.sizeY = sizeRect[1];

		this.texelSizeX = 1.0 / sizeRect[0];
		this.texelSizeY = 1.0 / sizeRect[1];

		const { frameBuffer, texture } = this.createFBOWithTexture(
			gl,
			level,
			sizeRect[0],
			sizeRect[1]
		);
		this.frameBuffer = <WebGLFramebuffer>frameBuffer;
		this.texture = texture;
		this.unbind(gl);
	}

	createFBOWithTexture(
		gl: GLContext,
		level: number,
		width: number,
		height: number
	) {
		const texture = this.createTexture(gl, level, width, height);

		const fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		const attachmentKey = `COLOR_ATTACHMENT0` as keyof WebGLRenderingContext;

		const attachmentPoint = <GLenum>gl[attachmentKey];

		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			attachmentPoint,
			gl.TEXTURE_2D,
			texture,
			level
		);

		WebGLDebugger.checkError(gl);

		return {
			texture,
			attachmentPoint,
			frameBuffer: fbo
		};
	}

	createTexture(
		gl: GLContext,
		level: number,
		width: number,
		height: number
	): WebGLTexture {
		const targetTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, targetTexture);

		const internalFormat = gl.RGBA;
		const border = 0;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
		const data = null;

		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			width,
			height,
			border,
			format,
			type,
			data
		);

		WebGLDebugger.checkError(gl);

		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		return targetTexture as WebGLTexture;
	}

	bind(gl: GLContext) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		WebGLDebugger.checkError(gl);
	}

	unbind(gl: GLContext) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	get texelSize() {
		return [this.texelSizeX, this.texelSizeY];
	}
}
