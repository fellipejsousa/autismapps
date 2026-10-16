// Build English and Swedish prerendered trees for the shared public URL.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const buildScript = fileURLToPath(new URL('./build-launcher.mjs', import.meta.url));
const basePath = process.env.LAUNCHER_BASE_PATH || '/launcher';

for (const { locale, outputDirectory } of [
	{ locale: 'en', outputDirectory: 'build' },
	{ locale: 'sv', outputDirectory: 'build-sv' }
]) {
	const result = spawnSync(process.execPath, [buildScript], {
		stdio: 'inherit',
		env: {
			...process.env,
			BASE_PATH: basePath,
			BUILD_OUTPUT_DIR: outputDirectory,
			CI: 'true',
			VITE_PRERENDER_LOCALE: locale
		}
	});

	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${locale} launcher build failed with status ${result.status}`);
}
