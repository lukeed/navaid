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
	t.is(foo.format('foo/bar/'), '/foo/bar');
	t.is(foo.format('foo/bar'), '/foo/bar');
	t.is(foo.format('/foobar'), '/foobar');
	t.is(foo.format('foobar'), '/foobar');

	let bar = new Navaid({ base: '/hello' });
	t.is(bar.format('/hello/world'), '/world');
	t.is(bar.format('hello/world'), '/world');
	t.is(bar.format('/world'), false);
	t.is(bar.format('/hello/'), '/');
	t.is(bar.format('hello/'), '/');
	t.is(bar.format('/hello'), '/');
	t.is(bar.format('hello'), '/');

	let baz = new Navaid({ base: 'hello' });
	t.is(baz.format('/hello/world'), '/world');
	t.is(baz.format('hello/world'), '/world');
	t.is(baz.format('/hello.123'), false);
	t.is(baz.format('/world'), false);
	t.is(baz.format('/hello/'), '/');
	t.is(baz.format('hello/'), '/');
	t.is(baz.format('/hello'), '/');
	t.is(baz.format('hello'), '/');

	let bat = new Navaid({ base: 'hello/' });
	t.is(bat.format('/hello/world'), '/world');
	t.is(bat.format('hello/world'), '/world');
	t.is(bat.format('/hello.123'), false);
	t.is(bat.format('/world'), false);
	t.is(bat.format('/hello/'), '/');
	t.is(bat.format('hello/'), '/');
	t.is(bat.format('/hello'), '/');
	t.is(bat.format('hello'), '/');

	let quz = new Navaid({ base: '/hello/' });
	t.is(quz.format('/hello/world'), '/world');
	t.is(quz.format('hello/world'), '/world');
	t.is(quz.format('/hello.123'), false);
	t.is(quz.format('/world'), false);
	t.is(quz.format('/hello/'), '/');
	t.is(quz.format('hello/'), '/');
	t.is(quz.format('/hello'), '/');
	t.is(quz.format('hello'), '/');

	let qut = new Navaid({ base: '/' });
	t.is(qut.format('/hello/world'), '/hello/world');
	t.is(qut.format('hello/world'), '/hello/world');
	t.is(qut.format('/world'), '/world');
	t.is(qut.format('/'), '/');

	let qar = new Navaid({ base: '/hello/there' });
	t.is(qar.format('hello/there/world/'), '/world');
	t.is(qar.format('/hello/there/world/'), '/world');
	t.is(qar.format('/hello/there/world?foo=bar'), '/world?foo=bar');
	t.is(qar.format('/hello/there'), '/');
	t.is(qar.format('hello/there'), '/');
	t.is(qar.format('/world'), false);
	t.is(qar.format('/'), false);

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

test('$.run (base)', t => {
	t.plan(13);
	let ctx = new Navaid({ base: '/hello/world/' });

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

	let foo = ctx.run('/hello/world');
	t.same(foo, ctx, '~> allows chained methods');

	ctx.run('/hello/world/users/Bob');
	ctx.run('hello/world/foo/books/kids');
	ctx.run('hello/world/foo/books/kids/narnia');
});

test('$.run (wildcard)', t => {
	t.plan(4);

	let ran = false;
	let ctx = new Navaid();
	ctx.on('foo/bar/*', o => {
		t.pass('~> called "foo/bar/*" route');
		let wild = ran ? 'baz/bat/quz' : 'baz';
		t.same(o, { wild }, '~> o.wild is expected');
		ran = true;
	});

	ctx.run('foo/bar/baz');
	ctx.run('foo/bar/baz/bat/quz');
});

test('$.run (404)', t => {
	t.plan(11);

	let ran = false;
	let foo = new Navaid({
		on404(x) {
			t.pass('~~> called `on404` handler');
			let uri = ran ? '/foo/bar' : '/bar';
			t.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
			ran = true;
		}
	});

	foo.on('/foo', () => {
		t.pass('~> called "/foo" route');
	});

	foo.run('/foo'); // +1
	foo.run('bar'); // +2
	foo.run('/foo/bar'); // +2

	ran = false;
	let bar = new Navaid({
		base: '/hello/',
		on404(x) {
			t.pass('~~> called `on404` handler');
			let uri = ran ? '/there/world' : '/world';
			t.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
			ran = true;
		}
	});

	bar.on('/', () => {
		t.pass('~> called "/hello" route');
	});

	bar.on('/bob', () => {
		t.pass('~> called "/hello/bob" route');
	});

	bar.run('/hello'); // +1
	bar.run('/hello/bob'); // +1
	bar.run('/hello/world'); // +2
	bar.run('/hello/there/world'); // +2
	bar.run('/world'); // +0 (base no match)
	bar.run('/'); // +0 (base no match)
});
