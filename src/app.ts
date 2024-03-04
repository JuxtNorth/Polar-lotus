import "./style.css";
import { Renderer, type RendererConfig } from "@/Renderer";
import {
	EffectComposer,
	BlurPass,
	BloomPass
} from "@/PostProcessing";
import GUI from "lil-gui";
import presets from "@/presets";

const canvas = <HTMLCanvasElement>(
	document.getElementById("renderer")!
);

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

animate();

setupGUI();

let currPresetIndex = 0;
setInterval(() => {
	currPresetIndex = (currPresetIndex + 1) % 3;
	setPreset(currPresetIndex, presets);
}, 1200);

function setPreset(index: number, presets: Omit<RendererConfig, "rotation">[]) {
	const { config } = renderer;
	const preset = presets[index];
	config.colorStop1.value = preset.colorStop1.value;
	config.colorStop2.value = preset.colorStop2.value;
	for (const key in preset.constants) {
		type ConstantsKey = keyof typeof config.constants;
		config.constants[key as ConstantsKey].value = preset.constants[key as ConstantsKey]!.value;
	}
}

function setupGUI () {
	const gui = new GUI();
	gui.open(false);
	
	const { config } = renderer;
	const { constants } = config;
	const folder = gui.addFolder("contants");
	
	const numerator = folder.addFolder("numerator");
	["a", "b", "c", "d", "e"].forEach(key => {
		numerator.add(constants[key as keyof typeof constants], "value", -6, 6).name(key).listen();
	});
	
	const denominator = folder.addFolder("denominator");
		["f", "g", "h", "i", "j"].forEach(key => {
		denominator.add(constants[key as keyof typeof constants], "value", -6, 6).name(key).listen();
	});
}