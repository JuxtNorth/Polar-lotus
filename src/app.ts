import './style.css';
import { Renderer } from '@/Renderer';
import { EffectComposer, BlurPass, BloomPass } from '@/PostProcessing';

const canvas = <HTMLCanvasElement>document.getElementById('renderer')!;

const renderer = new Renderer(canvas);

const composer = new EffectComposer();
composer.addPass(new BlurPass());
composer.addPass(new BloomPass());

renderer.setEffectComposer(composer);
renderer.render();

function animate() {
	requestAnimationFrame(animate);
	renderer.config.rotation.value += 0.02;
	renderer.render();
}

animate
// animate();