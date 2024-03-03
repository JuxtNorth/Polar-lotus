import path from 'path';
import pluginChecker from 'vite-plugin-checker';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [pluginChecker({ typescript: true })],
	resolve: {
		alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
	}
});
