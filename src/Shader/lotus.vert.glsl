attribute vec2 a_position;

void main (void) {
	gl_Position = vec4(a_position.xy, 0.0, 1.0);
}