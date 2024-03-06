import type { Color as ColorRGB } from '@/types';

export class Color {
	public r: number;
	public g: number;
	public b: number;

	constructor(r = 1, g = 1, b = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
	}

	setHSL(h: number, s = 0.8, l = 0.5): this {
		h = (h % 360) / 360;
		if (s == 0) {
			// achromatic
			this.r = 1;
			this.g = 1;
			this.b = 1;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;

			this.r = this.hue2rgb(p, q, h + 1 / 3);
			this.g = this.hue2rgb(p, q, h);
			this.b = this.hue2rgb(p, q, h - 1 / 3);
		}
		return this;
	}

	private hue2rgb(p: number, q: number, t: number): number {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}

	get rgb(): ColorRGB {
		return [...this] as ColorRGB;
	}

	*[Symbol.iterator]() {
		yield this.r;
		yield this.g;
		yield this.b;
	}
}
