import type { Color } from '@/types';
import type { RendererConfig } from '@/Renderer';

const presets: Omit<RendererConfig, 'rotation'>[] = [
	{
		colorStop1: { value: [1, 0, 0] as Color },
		colorStop2: { value: [1, 0, 1] as Color },
		constants: {
			a: { value: 3.0 },
			b: { value: 0.25 },
			c: { value: 3.0 },
			d: { value: 2.0 },
			e: { value: 2.0 },
			f: { value: 2.0 },
			g: { value: 6.0 },
			h: { value: 2.0 },
			i: { value: 8.0 },
			j: { value: 2.0 }
		}
	},
	{
		colorStop1: { value: [0.2, 0, 0.8] as Color },
		colorStop2: { value: [1, 0, 1] as Color },
		constants: {
			a: { value: 6.0 },
			b: { value: 0.25 },
			c: { value: 6.0 },
			d: { value: 2.0 },
			e: { value: 2.0 },
			f: { value: 2.0 },
			g: { value: 12.0 },
			h: { value: 2.0 },
			i: { value: 8.0 },
			j: { value: 2.0 }
		}
	},
	{
		colorStop1: { value: [0.3, 0.3, 1] as Color },
		colorStop2: { value: [0.3, 0.9, 1] as Color },
		constants: {
			a: { value: 3.0 },
			b: { value: 0.25 },
			c: { value: 3.0 },
			d: { value: 2.0 },
			e: { value: 2.0 },
			f: { value: 2.0 },
			g: { value: 6.0 },
			h: { value: 2.0 },
			i: { value: 8.0 },
			j: { value: 1.0 }
		}
	}
];

export default presets;
