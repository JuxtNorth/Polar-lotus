precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uBloom;

vec3 linearToGamma (vec3 color) {
	color = max(color, vec3(0));
	return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
}

void main() {
	vec3 outColor = texture2D(uTexture, vUv).rgb;
	vec3 bloom = texture2D(uBloom, vUv).rgb;

	bloom = linearToGamma(bloom);
	outColor += bloom;

	float a = max(outColor.r, max(outColor.g, outColor.b));
	gl_FragColor = vec4(outColor, 1.0);
}