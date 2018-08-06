import convert from 'regexparam';

export default function Navaid(opts) {
	opts = opts || {};
	let base, routes=[], handlers={}, $=this, PAT='route', SEP='/';

	let fmt = $.format = uri => {
		if (!uri) return uri;
		if (uri[0] != SEP) uri = SEP + uri;
		return uri.indexOf(base) == 0 ? uri.substring(base.length) : uri;
	}

	base = fmt(opts.base || '');

	$.route = (uri, replace) => {
		uri = fmt(uri);
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
		uri = fmt(uri || location.pathname);
		let obj = routes.find(x => x.pattern.test(uri));
		if (obj) {
			let i=0, params={}, arr=obj.pattern.exec(uri);
			while (i < obj.keys.length) params[obj.keys[i]]=arr[++i] || null;
			handlers[obj[PAT]](params); // todo loop?
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
			let x = e.target.closest('a');
			if (!x || !x.href || !!x.target) return;
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;
			$.route(x.getAttribute('href'));
			e.preventDefault();
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
