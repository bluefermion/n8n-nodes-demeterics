const { src, dest } = require('gulp');

// Copy icon assets (SVG/PNG) to dist for nodes and credentials
function buildIcons() {
    src('nodes/**/*.{svg,png}').pipe(dest('dist/nodes'));
    return src('credentials/**/*.{svg,png}').pipe(dest('dist/credentials'));
}

exports['build:icons'] = buildIcons;
