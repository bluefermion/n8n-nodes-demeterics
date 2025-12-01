const { src, dest } = require('gulp');

// Copy SVG icons to dist folder
function buildIcons() {
	return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
