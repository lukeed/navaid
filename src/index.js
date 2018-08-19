import convert from 'regexparam';

export default function Navaid(opts) {
	opts = opts || {};
	let rgx, routes=[], handlers={}, $=this, PAT='route';

	let fmt = $.format = uri => {
		if (!uri) return uri;
		uri = '/' + uri.replace(/^\/|\/$/g, '');
		return rgx ? rgx.test(uri) && (uri.replace(rgx, '') || '/') : uri;
	}

	let base = fmt(opts.base);
	if (base === '/') base = '';
	if (base) {
		rgx = new RegExp('^/?' + base.substring(1) + '(?=/|$)', 'i');
	}

	$.route = (uri, replace) => {
		history[(replace ? 'replace' : 'push') + 'State'](base + uri, null, base + uri);
	}

	$.on = (pat, fn) => {
		handlers[pat] = fn;
		let o = convert(pat);
		o[PAT] = pat;
		routes.push(o);
		return $;
	}

	$.run = uri => {
		uri = fmt(uri || location.pathname);
		if (!uri) return $;
		let obj = routes.find(x => x.pattern.test(uri));
		if (obj) {
			let i=0, params={}, arr=obj.pattern.exec(uri);
			while (i < obj.keys.length) params[obj.keys[i]]=arr[++i] || null;
			handlers[obj[PAT]](params); // todo loop?
		} else if (opts.on404) {
			opts.on404(uri);
		}
		return $;
	}

	$.listen = () => {
		wrap('push');
		wrap('replace');

		function run(e) {
			$.run(e.uri);
		}

		function click(e) {
			let y, x = e.target.closest('a');
			if (!x || !x.href || x.target) return;
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;
			if (y = fmt(x.getAttribute('href'))) {
				e.preventDefault();
				$.route(y);
			}
		}

		let off = removeEventListener;
		addEventListener('popstate', run);
		addEventListener('replacestate', run);
		addEventListener('pushstate', run);
		addEventListener('click', click);

		$.unlisten = () => {
			off('popstate', run);
			off('replacestate', run);
			off('pushstate', run);
			off('click', click);
		};

		return $.run();
	}

	return $;
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
