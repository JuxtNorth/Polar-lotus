export type GLContext = WebGLRenderingContext;
export type GLShader = WebGLShader;
export type GLShaderType = 'vs' | 'fs';
export type GLProgram = WebGLProgram;
export type GLULocation = WebGLUniformLocation;
export type GLClearColor = [number, number, number, number];

export interface GLShaders {
	vs: GLShader;
	fs: GLShader;
}

export interface GLShaderSrc {
	vs: string;
	fs: string;
}

export interface GLShaderPaths {
	vs: string;
	fs: string;
}

export interface GLAttribInfo {
	data: ArrayBuffer;
	components: number;
}
