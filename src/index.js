import convert from 'regexparam';

function Navaid(opts) {
	opts = opts || {};
	let base = opts.base || '';
	let routes=[], handlers={}, $=this, PAT='route';

	$.toPath = uri => {
		uri = uri.indexOf(base) == 0 ? uri.substring(base.length) : uri;
		return (uri.charCodeAt(0) == 47) ? uri : '/' + uri;
	}

	$.route = (uri, replace) => {
		uri = $.toPath(uri);
		history[(replace ? 'replace' : 'push') + 'State'](uri, null, base + uri);
	}

	$.on = (pat, fn) => {
		handlers[pat] = fn;
		let o = convert(pat);
		o[PAT] = pat;
		routes.push(o);
		return $;
	}

	$.run = uri => {
		uri = $.toPath(uri || location.pathname);
		let obj = routes.find(x => x.pattern.test(uri));
		if (obj) {
			let i=0, params={}, arr=obj.pattern.exec(uri);
			while (i < obj.keys.length) params[obj.keys[i]]=arr[++i] || null;
			handlers[obj[PAT]](params); // todo loop?
		}
		return $;
	}

	return $;
}

export function init(o) {
	return new Navaid(o);
}


function wrap(type) {
	type += 'State';
	let fn = history[type];
	history[type] = function (uri) {
		let ev = new Event(type.toLowerCase());
		ev.uri = uri;
		fn.apply(this, arguments);
		return dispatchEvent(ev);
	}
}

export function listen(ctx) {
	wrap('push'); wrap('replace');

	function run(e) {
		ctx.run(e.uri);
	}

	addEventListener('popstate', run);
	addEventListener('replacestate', run);
	addEventListener('pushstate', run);

	addEventListener('click', e => {
		let x = e.target.closest('a');
		if (!x || !x.href || /^_?self$/i.test(x.target)) return;
		if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;
		ctx.route(x.getAttribute('href'));
		e.preventDefault();
	});
}
