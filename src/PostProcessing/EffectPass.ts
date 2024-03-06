import type { GLContext } from '@/WebGL';

abstract class EffectPass {
	public requiresUpdate = true;
	public isEnabled = true;

	enable(): this {
		this.isEnabled = true;
		return this;
	}

	disable(): this {
		this.isEnabled = false;
		return this;
	}

	abstract initFrameBuffer(gl: GLContext): void;
	abstract setup(gl: GLContext): void;
	abstract render(gl: GLContext, texture?: WebGLTexture): WebGLTexture;
}

export default EffectPass;
