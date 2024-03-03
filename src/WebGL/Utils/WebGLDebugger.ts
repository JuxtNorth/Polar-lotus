import type { GLContext, GLShader } from '../index';

export class WebGLDebugger {
	static checkError(gl: GLContext) {
		const error = gl.getError();
		if (error !== gl.NO_ERROR) {
			throw new Error('WebGL Error: ' + error);
		}
	}

	static checkCompileStatus(gl: GLContext, shader: GLShader) {
		const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

		if (!status) {
			const log = gl.getShaderInfoLog(shader);
			throw new Error(log as string);
		}
	}
}
