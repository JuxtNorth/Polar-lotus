import './style.css';
import { Renderer } from '@/Renderer';
import { EffectComposer, BlurPass, BloomPass } from '@/PostProcessing';
import { Color } from '@/Math';
import GUI from 'lil-gui';
import { inject } from "@vercel/analytics";

inject();

const canvas = <HTMLCanvasElement>document.getElementById('renderer')!;

const renderer = new Renderer(canvas);

const composer = new EffectComposer();
composer.addPass(new BlurPass());

const bloomPass = new BloomPass();
composer.addPass(bloomPass);

renderer.setEffectComposer(composer);
renderer.render();

let lastTimestamp = 0;

function animate(t: number) {
	requestAnimationFrame(animate);
	const dt = t - lastTimestamp;
	lastTimestamp = t;
	renderer.config.rotation.value += 0.0002 * dt;
	renderer.render();
}

requestAnimationFrame(animate);

const config = {
	hue: 170,
	hueDifference: 60
};

setupGUI();

const stop1 = new Color().setHSL(config.hue);
const stop2 = new Color().setHSL(config.hue + 60);

updateRenderer();

function updateRenderer() {
	const { hue, hueDifference } = config;
	stop1.setHSL(hue, 0.9);
	stop2.setHSL(hue + hueDifference, 0.9);
	renderer.config.colorStop1.value = stop1.rgb;
	renderer.config.colorStop2.value = stop2.rgb;
	renderer.render();
}

function setupGUI() {
	const gui = new GUI();
	gui.open(false);
	gui.add(renderer.config.scale, 'value', 0.02, 0.64).name('scale');
	const folder = gui.addFolder('Color');
	folder.add(config, 'hue', 0, 360, 1).onChange(() => updateRenderer());
	folder
		.add(config, 'hueDifference', 0, 90, 1)
		.onChange(() => updateRenderer());

	const bloomFolder = gui.addFolder('bloom');
	bloomFolder.add(bloomPass, 'isEnabled');
	bloomFolder.add(bloomPass, 'threshold', 0, 1);
	bloomFolder.add(bloomPass, 'intensity', 0, 1.5);
}
