precision highp float;

uniform vec2 u_size;

vec2 polar_to_cartesian (float theta) {
	return vec2(cos(theta), sin(theta));
}

float get_angle(vec2 a, vec2 b) {
	return dot(a, b) / (length(a) * length(b));
}

bool isDivisble(float a, float b) {
	float q = b / a;
	return floor(a) - b == 0.0;
}

const float PI = 3.14159;

uniform vec3 colorStop1;
uniform vec3 colorStop2;

uniform float rotation;

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
	float r3 = r( rotation2 + theta, 3.0, 6.0, 1.0);

	float radius = 0.1;
	float cosTheta = cos(theta);
	float sinTheta = sin(theta);

	vec2 r1Coord = vec2(
		r1 * radius * cosTheta,
		r1 * radius * sinTheta
	);
	vec2 r2Coord = vec2(
		r2 * radius * cosTheta,
		r2 * radius * sinTheta
	);
	vec2 r3Coord = vec2(
		r3 * radius * cosTheta,
		r3 * radius * sinTheta
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
	vec3 out_color = vec3(0.0);

	coord += offset;

	vec2 gap1 = vec2(size1);
	float x1 = mod(coord.x, gap1.x);
	float y1 = mod(coord.y, gap1.y);

	vec2 gap2 = vec2(size2);
	float x2 = mod(coord.x, gap2.x);
	float y2 = mod(coord.y, gap2.y);

	if (int(x1) == 0 || int(y1) == 0) {
		out_color += 0.25;
	}
	if (int(x2) == 0 || int(y2) == 0) {
		out_color += 0.25;
	}

	return out_color;
}

void main() {
	vec3 out_color = vec3(0.0);

	vec2 pixel = vec2(gl_FragCoord.xy);
	vec2 uv = pixel - u_size * 0.5;
	uv /= u_size.x;

	vec2 grid_offset = vec2(-8.0, 8.0);
	out_color += getGridColor(pixel, grid_offset, 32.0, 128.0);

	vec2 mid = vec2(0.0);

	vec2 delta = mid - uv;
	float dist = length(delta);
	float theta = PI + atan(delta.y, delta.x);

	float t = lotus(uv, theta);

	if (t > -1.0) {
		out_color = mix(colorStop1, colorStop2, t);
	}

	gl_FragColor = vec4(out_color, 1.0);
}