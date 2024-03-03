export class Canvas {
	dom: HTMLCanvasElement;
	rect: DOMRect;
	dpr: number = 1;

	constructor(canvas: HTMLCanvasElement) {
		this.dom = canvas;
		this.rect = this.dom.getBoundingClientRect();
		this.resize();
	}

	updateRect() {
		this.rect = this.dom.getBoundingClientRect();
	}

	setPixelRatio(dpr: number) {
		this.dpr = dpr;
	}

	setupResizeObserver(callback?: () => void) {
		const observer = new ResizeObserver(() => {
			this.updateRect();
			this.resize();
			if (callback) callback();
		});
		observer.observe(this.dom);
	}

	resize() {
		const { dom, rect, dpr } = this;
		dom.width = rect.width * dpr;
		dom.height = rect.height * dpr;
	}

	get size(): [number, number] {
		const { dom } = this;
		return [dom.width, dom.height];
	}
}
