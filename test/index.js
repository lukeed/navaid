import test from 'tape';
import navaid from '../src';

global.history = {};

test('exports', t => {
	t.is(typeof navaid, 'function', 'exports a function');

	let foo = new navaid();
	t.is(typeof foo.route, 'function', '~> $.route is a function');
	t.is(typeof foo.format, 'function', '~> $.format is a function');
	t.is(typeof foo.listen, 'function', '~> $.listen is a function');
	t.is(typeof foo.run, 'function', '~> $.run is a function');
	t.is(typeof foo.on, 'function', '~> $.on is a function');

	let bar = navaid();
	t.is(typeof bar.route, 'function', '~> navaid().route is a function');
	t.is(typeof bar.format, 'function', '~> navaid().format is a function');
	t.is(typeof bar.listen, 'function', '~> navaid().listen is a function');
	t.is(typeof bar.run, 'function', '~> navaid().run is a function');
	t.is(typeof bar.on, 'function', '~> navaid().on is a function');

	t.same(Object.keys(foo), Object.keys(bar), `new Navaid() === navaid()`);

	t.end();
});

test('$.format', t => {
	let foo = navaid();
	t.is(foo.format(''), '');
	t.is(foo.format('/'), '/');
	t.is(foo.format('foo/bar/'), '/foo/bar');
	t.is(foo.format('foo/bar'), '/foo/bar');
	t.is(foo.format('/foobar'), '/foobar');
	t.is(foo.format('foobar'), '/foobar');

	let bar = navaid('/hello');
	t.is(bar.format('/hello/world'), '/world');
	t.is(bar.format('hello/world'), '/world');
	t.is(bar.format('/world'), false);
	t.is(bar.format('/hello/'), '/');
	t.is(bar.format('hello/'), '/');
	t.is(bar.format('/hello'), '/');
	t.is(bar.format('hello'), '/');

	let baz = new navaid('hello');
	t.is(baz.format('/hello/world'), '/world');
	t.is(baz.format('hello/world'), '/world');
	t.is(baz.format('/hello.123'), false);
	t.is(baz.format('/world'), false);
	t.is(baz.format('/hello/'), '/');
	t.is(baz.format('hello/'), '/');
	t.is(baz.format('/hello'), '/');
	t.is(baz.format('hello'), '/');

	let bat = navaid('hello/');
	t.is(bat.format('/hello/world'), '/world');
	t.is(bat.format('hello/world'), '/world');
	t.is(bat.format('/hello.123'), false);
	t.is(bat.format('/world'), false);
	t.is(bat.format('/hello/'), '/');
	t.is(bat.format('hello/'), '/');
	t.is(bat.format('/hello'), '/');
	t.is(bat.format('hello'), '/');

	let quz = new navaid('/hello/');
	t.is(quz.format('/hello/world'), '/world');
	t.is(quz.format('hello/world'), '/world');
	t.is(quz.format('/hello.123'), false);
	t.is(quz.format('/world'), false);
	t.is(quz.format('/hello/'), '/');
	t.is(quz.format('hello/'), '/');
	t.is(quz.format('/hello'), '/');
	t.is(quz.format('hello'), '/');

	let qut = navaid('/');
	t.is(qut.format('/hello/world'), '/hello/world');
	t.is(qut.format('hello/world'), '/hello/world');
	t.is(qut.format('/world'), '/world');
	t.is(qut.format('/'), '/');

	let qar = new navaid('/hello/there');
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
	let ctx = new navaid();
	let foo = ctx.on('/', () => 'index');
	t.same(ctx, foo, '~> allows chained methods');
	let bar = foo.on('hello', () => 'world');
	t.same(foo, bar, '~> still chainabled');
	t.end();
});

test('$.run', t => {
	t.plan(13);
	let ctx = new navaid();

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
	let ctx = navaid('/hello/world/');

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
	let ctx = new navaid();
	ctx.on('foo/bar/*', o => {
		t.pass('~> called "foo/bar/*" route');
		let wild = ran ? 'baz/bat/quz' : 'baz';
		t.same(o, { wild }, '~> o.wild is expected');
		ran = true;
	});

	ctx.run('foo/bar/baz');
	ctx.run('foo/bar/baz/bat/quz');
});

test('$.run (query)', t => {
	t.plan(4);

	let ctx = (
		navaid()
			.on('foo/*', o => {
				t.pass('~> called "foo/*" route');
				t.is(o.wild, 'baz/bat', '~> trims query from "wild" key');
			})
			.on('/bar/:id', o => {
				t.pass('~> called "/bar/:id" route');
				t.is(o.id, 'hello', '~> trims query from "id" key');
			})
	);

	ctx.run('foo/baz/bat?abc=123');
	ctx.run('bar/hello?a=b&c=d');
});

test('$.run (404)', t => {
	t.plan(11);

	let ran = false;
	let foo = navaid('/', x => {
		t.pass('~~> called `on404` handler');
		let uri = ran ? '/foo/bar' : '/bar';
		t.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
		ran = true;
	});

	foo.on('/foo', () => {
		t.pass('~> called "/foo" route');
	});

	foo.run('/foo'); // +1
	foo.run('bar'); // +2
	foo.run('/foo/bar'); // +2

	ran = false;
	let bar = new navaid('/hello/', x => {
		t.pass('~~> called `on404` handler');
		let uri = ran ? '/there/world' : '/world';
		t.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
		ran = true;
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

test('$.listen', t => {
	t.plan(12);
	let ctx = navaid();

	let events = [];
	function pushState() {}
	function replaceState() {}

	history.pushState = pushState;
	history.replaceState = replaceState;

	global.addEventListener = function (evt) {
		events.push(evt);
	}

	global.removeEventListener = function (evt) {
		events.splice(events.indexOf(evt) >>> 1);
	}

	ctx.run = uri => {
		t.is(uri, undefined, '~> called $.run() w/o a uri value');
		return ctx; // match source
	};

	// ---

	let foo = ctx.listen();
	t.true(foo == ctx, '(listen) returns the navaid instance');
	t.is(typeof foo.unlisten, 'function', '~> added `unlisten()` method');

	t.false(history.pushState === pushState, 'wrapped `history.pushState` function');
	t.false(history.replaceState === replaceState, 'wrapped `history.replaceState` function');

	t.is(events.length, 4, 'added 4 global event listeners');
	t.true(events.includes('popstate'), '~> has "popstate" listener');
	t.true(events.includes('replacestate'), '~> has "replacestate" listener');
	t.true(events.includes('pushstate'), '~> has "pushstate" listener');
	t.true(events.includes('click'), '~> has "click" listener');

	let bar = ctx.unlisten();
	t.is(bar, undefined, '(unlisten) returns nothing');
	t.is(events.length, 0, '~> removed all global event listeners');
});

test('$.listen(uri)', t => {
	t.plan(1);
	let ctx = navaid();

	global.addEventListener = global.removeEventListener = () => {};

	ctx.run = uri => {
		t.is(uri, '/foobar', '~> called $.run() w/ "/foobar" value');
		return ctx; // match source
	};

	// ---

	ctx.listen('/foobar');
});

test('$.route', t => {
	t.plan(15);

	let pushes = [], replaces = [];
	history.pushState = uri => pushes.push(uri);
	history.replaceState = uri => replaces.push(uri);

	let ctx = (
		navaid('/', () => t.pass('~> ran 404 handler'))
			.on('/foo', () => t.pass('~> ran "/foo" route'))
			.on('/bar', () => t.pass('~> ran "/bar" route'))
	);

	let mock = uri => {
		pushes = [];
		replaces = [];
		console.log(`"${uri}"`);
		ctx.route(uri);
		ctx.run(uri);
	};

	// ---

	mock('/foo'); // +1
	t.is(pushes.length, 1, '~> pushState("/foo")');
	t.is(replaces.length, 0, '~> no replaceState calls');

	mock('/foo'); // +1
	t.is(pushes.length, 0, '~> no pushState calls');
	t.is(replaces.length, 1, '~> replaceState("/foo") (repeat)');

	mock('/bar'); // +1
	t.is(pushes.length, 1, '~> pushState("/bar")');
	t.is(replaces.length, 0, '~> no replaceState calls');

	mock('/404'); // +1
	t.is(pushes.length, 1, '~> pushState("/404")');
	t.is(replaces.length, 0, '~> no replaceState calls');

	mock('/404'); // +1
	t.is(pushes.length, 0, '~> no pushState calls');
	t.is(replaces.length, 1, '~> replaceState("/404") (repeat)');
});
