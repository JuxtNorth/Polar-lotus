import './style.css';
import { Renderer } from '@/Renderer';
import { EffectComposer, BlurPass, BloomPass } from '@/PostProcessing';
import { Color } from "@/Math";
import GUI from "lil-gui";

const canvas = <HTMLCanvasElement>document.getElementById('renderer')!;

const renderer = new Renderer(canvas);

const composer = new EffectComposer();
composer.addPass(new BlurPass());
composer.addPass(new BloomPass());

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
	hue: 0,
	hueDifference: 15,
};

setupGUI();

const stop1 = new Color(1, 0, 0);
const stop2 = new Color(1, 0, 1);

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
	const folder = gui.addFolder("Color");
	folder.add(config, "hue", 0, 360, 1).onChange(() => updateRenderer());
	folder.add(config, "hueDifference", 0, 90, 1).onChange(() => updateRenderer());
}