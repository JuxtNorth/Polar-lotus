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

float alpha = 2.0;
float beta = 0.25;
float gamma = 2.0;
float zeta = 8.0;

float r(float theta) {

	float a = 3.0,
	b = 0.25,
	c = 3.0,
	d = 2.0,
	e = 2.0;

	float numerator = abs(cos(theta * a)) + b - abs(cos(theta * c + PI / d)) * e;

	float f = 2.0,
	g = 6.0,
	h = 2.0,
	i = 8.0,
	j = 2.0;

	float denominator = f + abs(cos(theta * g + PI / h)) * i;

	return j + (numerator / denominator);
}

void main() {
	vec3 out_color = vec3(0.0);

	vec2 pixel = vec2(gl_FragCoord.xy);
	vec2 uv = pixel - u_size * 0.5;
	uv /= u_size.x;

	// draw a grid
	vec2 gap = vec2(32.0);
	vec2 grid_offset = vec2(-8.0, 8.0);
	float x = mod(pixel.x + grid_offset.x, gap.x);
	float y = mod(pixel.y + grid_offset.y, gap.y);

	if (int(x) == 0 || int(y) == 0) {
		out_color += 0.25;
	}

	vec2 mid = vec2(0.0);

	vec2 delta = mid - uv;
	float dist = length(delta);
	float theta = PI + atan(delta.y, delta.x);

	float r1 = r(theta);

	float radius = 0.15;

	float rx = r1 * radius * cos(theta);
	float ry = r1 * radius * sin(theta);

	float espilon = 0.01;

	float s = smoothstep(espilon, -espilon, length(uv - vec2(rx, ry)));

	if (
		uv.x < rx + espilon &&
		uv.x > rx - espilon &&
		uv.y < ry + espilon &&
		uv.y > ry - espilon
	) {
	//	float b = 0.2 + theta / (PI * 2.0);
		float b = uv.x + uv.y + 0.3;
		out_color = vec3(1.0, 0.0, b);
	}
	
	gl_FragColor = vec4(out_color, 1.0);
}