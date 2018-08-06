const test = require('tape');
const Navaid = require('../dist/navaid');

test('exports', t => {
	t.is(typeof Navaid, 'function', 'exports a function');

	let ctx = new Navaid();
	t.is(typeof ctx.route, 'function', '~> $.route is a function');
	t.is(typeof ctx.format, 'function', '~> $.format is a function');
	t.is(typeof ctx.listen, 'function', '~> $.listen is a function');
	t.is(typeof ctx.run, 'function', '~> $.run is a function');
	t.is(typeof ctx.on, 'function', '~> $.on is a function');
	t.end();
});

test('$.format', t => {
	let foo = new Navaid();
	t.is(foo.format(''), '');
	t.is(foo.format('/'), '/');
	t.is(foo.format('foo/bar'), '/foo/bar');
	t.is(foo.format('/foobar'), '/foobar');
	t.is(foo.format('foobar'), '/foobar');

	let base = '/hello';
	let bar = new Navaid({ base });
	t.is(bar.format('/world'), '/world');
	t.is(bar.format('/hello/world'), '/world');
	t.is(bar.format('hello/world'), '/world');

	let baz = new Navaid({ base: 'hello' });
	t.is(baz.format('/hello/world'), '/world');
	t.is(baz.format('hello/world'), '/world');
	t.is(baz.format('/world'), '/world');

	t.end();
});

test('$.on', t => {
	let ctx = new Navaid();
	let foo = ctx.on('/', () => 'index');
	t.same(ctx, foo, '~> allows chained methods');
	let bar = foo.on('hello', () => 'world');
	t.same(foo, bar, '~> still chainabled');
	t.end();
});

test('$.run', t => {
	t.plan(13);
	let ctx = new Navaid();

	ctx.on('/', () => {
		t.pass('~> ran index');
	});

	ctx.on('users/:name', o => {
		t.ok(o, '~> (users) received params object');
		t.ok(o.name, '~> (users) has "name" key, via pattern');
		t.is(o.name, 'Bob', '~> (users) the "name" value is expected');
	});

	ctx.on('/foo/books/:genre/:title?', o => {
		t.ok(o, '~> (books) received params object');
		t.ok(o.genre, '~> (books) has "genre" key, via pattern');
		t.is(o.genre, 'kids', '~> (books) the "genre" value is expected');
		if (o.title) {
			t.ok(o.title, '~> (books) optionally has "title" key');
			t.is(o.title, 'narnia', '~> (books) the "title" value is expected');
		}
	});

	let foo = ctx.run('/');
	t.same(foo, ctx, '~> allows chained methods');

	ctx.run('/users/Bob');
	ctx.run('foo/books/kids');
	ctx.run('/foo/books/kids/narnia');
});
