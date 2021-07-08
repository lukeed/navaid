import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import navaid from '../src';

global.history = {};

const API = suite('exports');

API('exports', () => {
	assert.type(navaid, 'function', 'exports a function');
});

API('new Navaid()', () => {
	let foo = new navaid();
	assert.type(foo.route, 'function');
	assert.type(foo.format, 'function');
	assert.type(foo.listen, 'function');
	assert.type(foo.run, 'function');
	assert.type(foo.on, 'function');
});

API('Navaid()', () => {
	let bar = navaid();
	assert.type(bar.route, 'function');
	assert.type(bar.format, 'function');
	assert.type(bar.listen, 'function');
	assert.type(bar.run, 'function');
	assert.type(bar.on, 'function');
});

API.run();

// ---

const format = suite('$.format');

format('empty base', () => {
	let foo = navaid();
	assert.is(foo.format(''), '');
	assert.is(foo.format('/'), '/');
	assert.is(foo.format('foo/bar/'), '/foo/bar');
	assert.is(foo.format('foo/bar'), '/foo/bar');
	assert.is(foo.format('/foobar'), '/foobar');
	assert.is(foo.format('foobar'), '/foobar');
});

format('base with leading slash', () => {
	let bar = navaid('/hello');
	assert.is(bar.format('/hello/world'), '/world');
	assert.is(bar.format('hello/world'), '/world');
	assert.is(bar.format('/world'), false);
	assert.is(bar.format('/hello/'), '/');
	assert.is(bar.format('hello/'), '/');
	assert.is(bar.format('/hello'), '/');
	assert.is(bar.format('hello'), '/');
});

format('base without leading slash', () => {
	let baz = new navaid('hello');
	assert.is(baz.format('/hello/world'), '/world');
	assert.is(baz.format('hello/world'), '/world');
	assert.is(baz.format('/hello.123'), false);
	assert.is(baz.format('/world'), false);
	assert.is(baz.format('/hello/'), '/');
	assert.is(baz.format('hello/'), '/');
	assert.is(baz.format('/hello'), '/');
	assert.is(baz.format('hello'), '/');
});

format('base with trailing slash', () => {
	let bat = navaid('hello/');
	assert.is(bat.format('/hello/world'), '/world');
	assert.is(bat.format('hello/world'), '/world');
	assert.is(bat.format('/hello.123'), false);
	assert.is(bat.format('/world'), false);
	assert.is(bat.format('/hello/'), '/');
	assert.is(bat.format('hello/'), '/');
	assert.is(bat.format('/hello'), '/');
	assert.is(bat.format('hello'), '/');
});

format('base with leading and trailing slash', () => {
	let quz = new navaid('/hello/');
	assert.is(quz.format('/hello/world'), '/world');
	assert.is(quz.format('hello/world'), '/world');
	assert.is(quz.format('/hello.123'), false);
	assert.is(quz.format('/world'), false);
	assert.is(quz.format('/hello/'), '/');
	assert.is(quz.format('hello/'), '/');
	assert.is(quz.format('/hello'), '/');
	assert.is(quz.format('hello'), '/');
});

format('base = "/" only', () => {
	let qut = navaid('/');
	assert.is(qut.format('/hello/world'), '/hello/world');
	assert.is(qut.format('hello/world'), '/hello/world');
	assert.is(qut.format('/world'), '/world');
	assert.is(qut.format('/'), '/');
});

format('base with nested path', () => {
	let qar = new navaid('/hello/there');
	assert.is(qar.format('hello/there/world/'), '/world');
	assert.is(qar.format('/hello/there/world/'), '/world');
	assert.is(qar.format('/hello/there/world?foo=bar'), '/world?foo=bar');
	assert.is(qar.format('/hello/there'), '/');
	assert.is(qar.format('hello/there'), '/');
	assert.is(qar.format('/world'), false);
	assert.is(qar.format('/'), false);
});

format.run();

// ---

const on = suite('$.on');

on('$.on', () => {
	let ctx = new navaid();
	let foo = ctx.on('/', () => 'index');
	assert.equal(ctx, foo, '~> allows chained methods');
	let bar = foo.on('hello', () => 'world');
	assert.equal(foo, bar, '~> still chainabled');
});

on.run();

// ---

const run = suite('$.run');

run('$.run', () => {
	let planned = 12;
	let ctx = new navaid();

	ctx.on('/', () => {
		planned -= 1;
	});

	ctx.on('users/:name', o => {
		assert.ok(o, '~> (users) received params object');
		assert.ok(o.name, '~> (users) has "name" key, via pattern');
		assert.is(o.name, 'Bob', '~> (users) the "name" value is expected');
		planned -= 3;
	});

	ctx.on('/foo/books/:genre/:title?', o => {
		assert.ok(o, '~> (books) received params object');
		assert.ok(o.genre, '~> (books) has "genre" key, via pattern');
		assert.is(o.genre, 'kids', '~> (books) the "genre" value is expected');
		planned -= 3;
		if (o.title) {
			assert.ok(o.title, '~> (books) optionally has "title" key');
			assert.is(o.title, 'narnia', '~> (books) the "title" value is expected');
			planned -= 2;
		}
	});

	let foo = ctx.run('/');
	assert.equal(foo, ctx, '~> allows chained methods');

	ctx.run('/users/Bob');
	ctx.run('foo/books/kids');
	ctx.run('/foo/books/kids/narnia');

	assert.is(planned, 0);
});

run('$.run (base)', () => {
	let planned = 12;
	let ctx = navaid('/hello/world/');

	ctx.on('/', () => {
		planned -= 1;
	});

	ctx.on('users/:name', o => {
		assert.ok(o, '~> (users) received params object');
		assert.ok(o.name, '~> (users) has "name" key, via pattern');
		assert.is(o.name, 'Bob', '~> (users) the "name" value is expected');
		planned -= 3;
	});

	ctx.on('/foo/books/:genre/:title?', o => {
		assert.ok(o, '~> (books) received params object');
		assert.ok(o.genre, '~> (books) has "genre" key, via pattern');
		assert.is(o.genre, 'kids', '~> (books) the "genre" value is expected');
		planned -= 3;
		if (o.title) {
			assert.ok(o.title, '~> (books) optionally has "title" key');
			assert.is(o.title, 'narnia', '~> (books) the "title" value is expected');
			planned -= 2;
		}
	});

	let foo = ctx.run('/hello/world');
	assert.equal(foo, ctx, '~> allows chained methods');

	ctx.run('/hello/world/users/Bob');
	ctx.run('hello/world/foo/books/kids');
	ctx.run('hello/world/foo/books/kids/narnia');

	assert.is(planned, 0);
});

run('$.run (wildcard)', () => {
	let plan = 2;
	let ran = false;
	let ctx = new navaid();
	ctx.on('foo/bar/*', o => {
		let wild = ran ? 'baz/bat/quz' : 'baz';
		assert.equal(o, { wild }, '~> o.wild is expected');
		plan -= 1;
		ran = true;
	});

	ctx.run('foo/bar/baz');
	ctx.run('foo/bar/baz/bat/quz');

	assert.is(plan, 0);
});

run('$.run (query)', () => {
	let plan = 2;

	let ctx = (
		navaid()
			.on('foo/*', o => {
				plan -= 1;
				assert.is(o.wild, 'baz/bat', '~> trims query from "wild" key');
			})
			.on('/bar/:id', o => {
				plan -= 1;
				assert.is(o.id, 'hello', '~> trims query from "id" key');
			})
	);

	ctx.run('foo/baz/bat?abc=123');
	ctx.run('bar/hello?a=b&c=d');

	assert.is(plan, 0);
});

run('$.run (404)', () => {
	let plan = 11;
	let ran = false;
	let foo = navaid('/', x => {
		let uri = ran ? '/foo/bar' : '/bar';
		assert.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
		plan -= 2;
		ran = true;
	});

	foo.on('/foo', () => {
		plan -= 1;
	});

	foo.run('/foo'); // +1
	foo.run('bar'); // +2
	foo.run('/foo/bar'); // +2

	ran = false;
	let bar = new navaid('/hello/', x => {
		let uri = ran ? '/there/world' : '/world';
		assert.is(x, uri, `~~> handler receives the uri "${x}" (formatted)`);
		ran = true;
		plan -= 2;
	});

	bar.on('/', () => {
		plan -= 1;
	});

	bar.on('/bob', () => {
		plan -= 1;
	});

	bar.run('/hello'); // +1
	bar.run('/hello/bob'); // +1
	bar.run('/hello/world'); // +2
	bar.run('/hello/there/world'); // +2
	bar.run('/world'); // +0 (base no match)
	bar.run('/'); // +0 (base no match)

	assert.is(plan, 0);
});

run.run();

// ---

const listen = suite('$.listen');

listen('should setup `history` listeners and call $.run', () => {
	let plan = 12;
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
		plan -= 1;
		assert.is(uri, undefined, '~> called $.run() w/o a uri value');
		return ctx; // match source
	};

	// ---

	let foo = ctx.listen();
	assert.ok(foo == ctx, '(listen) returns the navaid instance');
	assert.is(typeof foo.unlisten, 'function', '~> added `unlisten()` method');
	plan -= 2;

	assert.not(history.pushState === pushState, 'wrapped `history.pushState` function');
	assert.not(history.replaceState === replaceState, 'wrapped `history.replaceState` function');
	plan -= 2;

	assert.is(events.length, 4, 'added 4 global event listeners');
	assert.ok(events.includes('popstate'), '~> has "popstate" listener');
	assert.ok(events.includes('replacestate'), '~> has "replacestate" listener');
	assert.ok(events.includes('pushstate'), '~> has "pushstate" listener');
	assert.ok(events.includes('click'), '~> has "click" listener');
	plan -= 5;

	let bar = ctx.unlisten();
	assert.is(bar, undefined, '(unlisten) returns nothing');
	assert.is(events.length, 0, '~> removed all global event listeners');
	plan -= 2;

	assert.is(plan, 0);
});

listen('should process given `uri` value', () => {
	let ran = false;
	let ctx = navaid();

	global.addEventListener = global.removeEventListener = () => {};

	ctx.run = uri => {
		ran = true;
		assert.is(uri, '/foobar', '~> called $.run() w/ "/foobar" value');
		return ctx; // match source
	};

	// ---

	ctx.listen('/foobar');
	assert.ok(ran);
});

listen.run();

//

const route = suite('$.route');

route('$.route', () => {
	let plan = 0;
	let pushes = [], replaces = [];
	history.pushState = uri => pushes.push(uri);
	history.replaceState = uri => replaces.push(uri);

	let ctx = (
		navaid('/', () => plan++)
			.on('/foo', () => plan++)
			.on('/bar', () => plan++)
	);

	let mock = uri => {
		pushes = [];
		replaces = [];
		ctx.route(uri);
		ctx.run(uri);
	};

	// ---

	mock('/foo'); // +1
	assert.is(pushes.length, 1, '~> pushState("/foo")');
	assert.is(replaces.length, 0, '~> no replaceState calls');

	mock('/foo'); // +1
	assert.is(pushes.length, 0, '~> no pushState calls');
	assert.is(replaces.length, 1, '~> replaceState("/foo") (repeat)');

	mock('/bar'); // +1
	assert.is(pushes.length, 1, '~> pushState("/bar")');
	assert.is(replaces.length, 0, '~> no replaceState calls');

	mock('/404'); // +1
	assert.is(pushes.length, 1, '~> pushState("/404")');
	assert.is(replaces.length, 0, '~> no replaceState calls');

	mock('/404'); // +1
	assert.is(pushes.length, 0, '~> no pushState calls');
	assert.is(replaces.length, 1, '~> replaceState("/404") (repeat)');

	assert.is(plan, 5);
});

route.run();
