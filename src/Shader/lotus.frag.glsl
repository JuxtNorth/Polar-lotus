precision highp float;
const float PI = 3.14159;

uniform vec2 uSize;
uniform vec3 colorStop1;
uniform vec3 colorStop2;
uniform float rotation;
uniform float scale;

float r(float theta, float a, float b, float c) {
	float numerator = abs(cos(theta * a)) + 0.25 - abs(cos(theta * a + PI / 2.0)) * 2.0;
	float denominator = 2.0 + abs(cos(theta * b + PI / 2.0)) * 8.0;
	return c + (numerator / denominator);
}

bool approxEquals(vec2 a, vec2 b, float espilon) {
	return (
		a.x < b.x + espilon &&
		a.x > b.x - espilon &&
		a.y < b.y + espilon &&
		a.y > b.y - espilon
	);
}

float rotation0 = rotation;
float rotation1 = rotation * 1.3;
float rotation2 = rotation * 1.5;

float lotus(vec2 uv, float theta) {
	float r1 = r(rotation0 + theta, 3.0, 6.0, 2.5);
	float r2 = r(rotation1 + theta, 6.0, 12.0, 4.0);
	float r3 = r(rotation2 + theta, 3.0, 6.0, 1.0);
	
	float cosTheta = cos(theta);
	float sinTheta = sin(theta);

	vec2 r1Coord = vec2(
		r1 * scale * cosTheta,
		r1 * scale * sinTheta
	);
	vec2 r2Coord = vec2(
		r2 * scale * cosTheta,
		r2 * scale * sinTheta
	);
	vec2 r3Coord = vec2(
		r3 * scale * cosTheta,
		r3 * scale * sinTheta
	);

	float t = -1.0;
	float espilon = 0.01;

	if (
		approxEquals(uv, r1Coord, espilon) ||
		approxEquals(uv, r2Coord, espilon) ||
		approxEquals(uv, r3Coord, espilon)
	) {
		// t = theta / (PI * 2.0);
		t = uv.x + uv.y + 0.4;
	}

	return t;
}


vec3 getGridColor(vec2 coord, vec2 offset, float size1, float size2) {
	vec3 outColor = vec3(0.0);
  
	coord += offset;

	vec2 gap1 = vec2(size1);
	float x1 = mod(coord.x, gap1.x);
	float y1 = mod(coord.y, gap1.y);

	vec2 gap2 = vec2(size2);
	float x2 = mod(coord.x, gap2.x);
	float y2 = mod(coord.y, gap2.y);

	if (int(x1) == 0 || int(y1) == 0) {
		outColor += 0.25;
	}
	if (int(x2) == 0 || int(y2) == 0) {
		outColor += 0.25;
	}

	return outColor;
}

void main() {
	vec3 outColor = vec3(0.0);

	vec2 pixel = vec2(gl_FragCoord.xy);
	vec2 uv = pixel - uSize * 0.5;
	uv /= uSize.x;
    
	vec2 gridOffset = -(uSize / 2.0);
	outColor += getGridColor(pixel, gridOffset, 32.0, 128.0);

	vec2 delta = -uv;
	float dist = length(delta);
	float theta = PI + atan(delta.y, delta.x);

	float t = lotus(uv, theta);

	if (t > -1.0) {
		outColor = mix(colorStop1, colorStop2, t);
	}

	gl_FragColor = vec4(outColor, 1.0);
}