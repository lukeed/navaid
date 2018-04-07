const { rollup } = require('rollup');
const { readFileSync } = require('fs');
const { minify } = require('uglify-js');
const pretty = require('pretty-bytes');
const sizer = require('gzip-size');
const pkg = require('./package');

let input = 'src/index.js';

let buble = require('rollup-plugin-buble')();
let resolve = require('rollup-plugin-node-resolve')();
let uglify = toplevel => {
	return require('rollup-plugin-uglify')({
		output: { comments:false },
		compress: { keep_infinity:true, pure_getters:true },
		warnings: true,
		toplevel,
		ecma: 5
	});
}

function config(file, format, opts={}) {
	let { name, external, plugins } = opts;
	return rollup({ input, plugins, external }).then(bun => {
		return bun.write({ format, name, file, strict:false });
	});
}

Promise.all([
	config(pkg.main, 'cjs', {
		plugins: [resolve, uglify(true)]
	}),
	config(pkg.module, 'es', {
		plugins: [resolve],
		external: Object.keys(pkg.dependencies)
	}),
	config(pkg['umd:main'], 'umd', {
		name: pkg['umd:name'],
		plugins: [resolve, buble, uglify(false)]
	}),
]).then(_ => {
	// output gzip size
	let cjs = readFileSync(pkg.main, 'utf8');
	let int = sizer.sync(cjs);
	console.log(`> gzip size: ${ pretty(int) }`);
});
