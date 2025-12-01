module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
	},
	ignorePatterns: ['.eslintrc.js', 'gulpfile.js', 'dist/**/*'],
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/community'],
	rules: {
		'n8n-nodes-base/node-param-description-missing-final-period': 'off',
	},
};
