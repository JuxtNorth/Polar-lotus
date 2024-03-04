import { GLContext, GLULocation } from '@/WebGL';

export type UniformValue<T> = { value: T }

export class WebGLUniform {
	private cache: number[] = [];
	private location: GLULocation;
	private bindingRef?: Record<string, any>;
	private bindingKey?: string;
	public setValue;

	constructor(location: GLULocation, type: GLenum) {
		this.location = location;
		this.setValue = this.getWebGLUniformSetter(type);
	}

	bind(ref: Record<string, any>, key: string) {
		this.bindingRef = ref;
		this.bindingKey = key;
	}

	update(gl: GLContext) {
		const { bindingRef, bindingKey } = this;
		if (bindingRef === undefined || bindingKey === undefined) return;

		this.setValue(gl, bindingRef[bindingKey]);
	}

	private getWebGLUniformSetter(type: GLenum) {
		switch (type) {
			case 0x1406:
				return this.set1f; // float
			case 0x8b50:
				return this.set2f; // fVec2
			case 0x8b51:
				return this.set3f; // fVec3

			case 0x1404:
				return this.set1i; // int
			case 0x8b53:
				return this.set2i; // iVec2
			case 0x8b54:
				return this.set3i; // iVec3

			case 0x8b5e:
				return this.set1i;

			default:
				console.error(
					`Unsupported WebGLUniform type: ${'0x' + type.toString(16)}`
				);
				return () => {
					console.error('This uniform is Unsupported');
				};
		}
	}

	private set1f(gl: GLContext, data: any) {
		const { cache } = this;
		if (cache[0] === data) return;
		gl.uniform1f(this.location, data);
		cache[0] = data;
	}

	private set1i(gl: GLContext, data: any) {
		const { cache } = this;
		if (cache[0] === data) return;
		gl.uniform1i(this.location, data);
		cache[0] = data;
	}

	private set2i(gl: GLContext, data: any) {
		const { cache } = this;
		if (this.arrayEquals(cache, data)) return;
		gl.uniform2i(this.location, data[0], data[1]);
		this.copyToCache(data);
	}

	private set2f(gl: GLContext, data: any) {
		const { cache } = this;
		if (this.arrayEquals(cache, data)) return;
		gl.uniform2f(this.location, data[0], data[1]);
		this.copyToCache(data);
	}

	private set3i(gl: GLContext, data: any) {
		const { cache } = this;
		if (this.arrayEquals(cache, data)) return;
		gl.uniform3i(this.location, data[0], data[1], data[2]);
		this.copyToCache(data);
	}

	private set3f(gl: GLContext, data: any) {
		const { cache } = this;
		if (this.arrayEquals(cache, data)) return;
		gl.uniform3f(this.location, data[0], data[1], data[2]);
		this.copyToCache(data);
	}

	private arrayEquals(a: number[], b: number[]): boolean {
		const len = Math.max(a.length, b.length);
		for (let i = 0; i < len; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	private copyToCache(data: number[]) {
		const { cache } = this;
		data.forEach((n, i) => {
			cache[i] = n;
		});
	}
}
