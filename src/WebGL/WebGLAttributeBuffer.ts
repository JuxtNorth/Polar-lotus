import { GLContext } from '@/WebGL';

export class WebGLAttributeBuffer {
	private buffer: WebGLBuffer;
	private components: number;
	private location: number;
	private datatype: GLint;

	constructor(
		gl: GLContext,
		data: ArrayBuffer,
		components: number,
		location: GLint
	) {
		this.components = components;
		this.location = location;
		this.datatype = this.getBufferDataType(gl, data);

		this.buffer = <WebGLBuffer>gl.createBuffer();
		this.update(gl, data);
	}

	update(gl: GLContext, data: ArrayBuffer): this {
		const { buffer } = this;

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return this;
	}

	set(gl: GLContext): this {
		const { location, components } = this;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, components, this.datatype, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return this;
	}

	private getBufferDataType(gl: GLContext, data: ArrayBuffer): GLint {
		if (data instanceof Float32Array) {
			return gl.FLOAT;
		} else if (data instanceof Uint16Array) {
			return gl.UNSIGNED_SHORT;
		} else if (data instanceof Int16Array) {
			return gl.SHORT;
		} else if (data instanceof Uint32Array) {
			return gl.UNSIGNED_INT;
		} else if (data instanceof Int32Array) {
			return gl.INT;
		} else if (data instanceof Int8Array) {
			return gl.BYTE;
		} else if (data instanceof Uint8Array) {
			return gl.UNSIGNED_BYTE;
		} else if (data instanceof Uint8ClampedArray) {
			return gl.UNSIGNED_BYTE;
		} else {
			throw new Error(`WebGLAttributBuffer: Unsupported format`);
		}
	}
}
