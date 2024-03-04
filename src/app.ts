import './style.css';
import { Renderer } from '@/Renderer';
import { EffectComposer, BlurPass, BloomPass } from '@/PostProcessing';
import GUI from 'lil-gui';

const canvas = <HTMLCanvasElement>document.getElementById('renderer')!;

const renderer = new Renderer(canvas);

const composer = new EffectComposer();
composer.addPass(new BlurPass());
composer.addPass(new BloomPass());

renderer.setEffectComposer(composer);
renderer.render();

function animate() {
	requestAnimationFrame(animate);
	renderer.render();
}

animate();

setupGUI();

function setupGUI() {
	const gui = new GUI();
	gui.open(false);

	const { constants } = renderer.config;
	const folder = gui.addFolder('contants');

	const numerator = folder.addFolder('numerator');
	['a', 'b', 'c', 'd', 'e'].forEach((key) => {
		numerator
			.add(constants[key as keyof typeof constants], 'value', -6, 6)
			.name(key);
	});

	const denominator = folder.addFolder('numerator');
	['f', 'g', 'h', 'i', 'j'].forEach((key) => {
		denominator
			.add(constants[key as keyof typeof constants], 'value', -6, 6)
			.name(key);
	});
}
