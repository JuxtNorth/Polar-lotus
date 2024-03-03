import type { GLContext } from '../types';

abstract class EffectPass {
	public requiresUpdate = true;

	abstract setup(gl: GLContext): void;
	abstract render(gl: GLContext, texture?: WebGLTexture): WebGLTexture;
}

export default EffectPass;
