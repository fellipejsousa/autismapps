// Build the static site for deployment under https://autismappar.se/launcher/.
process.env.BASE_PATH = process.env.LAUNCHER_BASE_PATH || '/launcher';
process.env.CI = 'true';

import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { build } = await import('vite');
await build();

// Keep extensionless static routes working even when an older deployment left
// a directory with the same name on the host (for example /launcher/about).
const outputDirectory = fileURLToPath(new URL('../build/', import.meta.url));
function addDirectoryIndexes(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const sourcePath = join(directory, entry.name);
		if (entry.isDirectory()) {
			addDirectoryIndexes(sourcePath);
			continue;
		}
		if (!entry.isFile() || !entry.name.endsWith('.html') || ['index.html', 'fallback.html'].includes(entry.name)) continue;

		const aliasPath = join(directory, entry.name.slice(0, -'.html'.length), 'index.html');
		mkdirSync(dirname(aliasPath), { recursive: true });
		copyFileSync(sourcePath, aliasPath);
	}
}
addDirectoryIndexes(outputDirectory);

// GitHub Pages serves 404.html for every unknown/deep client-side route. Keep
// the fallback payload intact so its sessionStorage redirect can restore the
// requested path before SvelteKit starts.
copyFileSync(join(outputDirectory, 'fallback.html'), join(outputDirectory, '404.html'));

// Preserve the old public URLs for speech and dyspraxia support.
for (const alias of ['verbal-dyspraxi', 'sprakstorning']) {
	const aliasDirectory = join(outputDirectory, 'apps', alias);
	mkdirSync(aliasDirectory, { recursive: true });
	writeFileSync(
		join(aliasDirectory, 'index.html'),
		'<!doctype html><html lang="sv"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/launcher/?category=speech"><title>Tal och språkstöd</title><p><a href="/launcher/?category=speech">Öppna tal och språkstöd</a></p></html>\n'
	);
}

copyFileSync(
	new URL('../deploy/launcher.htaccess', import.meta.url),
	new URL('../build/.htaccess', import.meta.url)
);
