import { WebGLDebugger, generateUniformBindings } from '@/WebGL/Utils';
import {
	type GLContext,
	type GLShader,
	WebGLUniform,
	WebGLAttributeBuffer
} from '@/WebGL';

export interface GLShaderSrc {
	vs: string;
	fs: string;
}

export class WebGLShaderProgram {
	private gl: GLContext;
	public program: WebGLProgram;
	public attributes: Map<string, WebGLAttributeBuffer> = new Map();
	public uniformSetters: Map<string, WebGLUniform> = new Map();

	constructor(gl: GLContext, src: GLShaderSrc) {
		this.gl = gl;
		this.program = this.create(src);
	}

	getWebGLUniformLocations(): Map<string, WebGLUniform> {
		const { gl, program } = this;

		const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

		for (let i = 0; i < count; i++) {
			const activeInfo = <WebGLActiveInfo>gl.getActiveUniform(program, i);

			const location = <WebGLUniformLocation>(
				gl.getUniformLocation(program, activeInfo.name)
			);

			const uniform = new WebGLUniform(location, activeInfo.type);

			this.uniformSetters.set(activeInfo.name, uniform);
		}

		return this.uniformSetters;
	}

	private create(src: GLShaderSrc): WebGLProgram {
		const { gl } = this;

		const program = <WebGLProgram>gl.createProgram();
		const vs = this.compileShader(src.vs, gl.VERTEX_SHADER);
		gl.attachShader(program, vs);

		const fs = this.compileShader(src.fs, gl.FRAGMENT_SHADER);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		WebGLDebugger.checkError(gl);
		return program;
	}

	private compileShader(src: string, type: any): GLShader {
		const { gl } = this;
		const shader = <GLShader>gl.createShader(type);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		WebGLDebugger.checkCompileStatus(gl, shader);
		return shader;
	}

	bind() {
		this.gl.useProgram(this.program);
	}

	unbind() {
		this.gl.useProgram(null);
	}

	initAttributes(attribs: any) {
		const { gl, program, attributes } = this;

		const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

		this.bind();

		for (let i = 0; i < count; i++) {
			const { name } = <WebGLActiveInfo>gl.getActiveAttrib(program, i);

			const location = gl.getAttribLocation(program, name);
			const attrib = new WebGLAttributeBuffer(
				gl,
				attribs[name].data,
				attribs[name].components,
				location
			);
			attrib.set(gl);
			attributes.set(name, attrib);
		}

		this.unbind();
	}

	initUniforms(uniforms: Record<string, any>) {
		const bindings = generateUniformBindings(uniforms);
		this.bindUniforms(bindings);
	}

	uploadUniforms() {
		const { uniformSetters, gl } = this;
		for (const [_, value] of uniformSetters) {
			value.update(gl);
		}
	}

	private bindUniforms(bindings: any) {
		const uniformSetters = this.getWebGLUniformLocations();

		for (const binding of bindings) {
			const uniform = uniformSetters.get(binding.name);
			if (uniform === undefined) {
				console.warn(
					'Undefined/Unused WebGLUniform in shader: ' + binding.name
				);
			} else {
				uniform.bind(binding.ref, binding.key);
			}
		}
	}

	setUniform(key: string, ref: { value: any }) {
		const uniform = this.uniformSetters.get(key);
		if (uniform) {
			uniform.bind(ref, 'value');
			uniform.update(this.gl!);
		} else {
			console.error(`No uniform with key ${key} found.`);
		}
	}

	setAttribute(key: string, data: ArrayBuffer) {
		const attribute = this.attributes.get(key);
		const { gl } = this;

		if (attribute) {
			attribute.update(gl, data).set(gl);
		}
	}
}
