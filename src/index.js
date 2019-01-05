import convert from 'regexparam';

export default function Navaid(base, on404) {
	var rgx, routes=[], handlers={}, $={}, PAT='route';

	var fmt = $.format = function (uri) {
		if (!uri) return uri;
		uri = '/' + uri.replace(/^\/|\/$/g, '');
		return rgx ? rgx.test(uri) && (uri.replace(rgx, '') || '/') : uri;
	}

	if ((base=fmt(base)) === '/') base = '';
	if (base) rgx = new RegExp('^/?' + base.substring(1) + '(?=/|$)', 'i');

	$.route = function (uri, replace) {
		history[(replace ? 'replace' : 'push') + 'State'](base + uri, null, base + uri);
	}

	$.on = function (pat, fn) {
		handlers[pat] = fn;
		var o = convert(pat);
		o[PAT] = pat;
		routes.push(o);
		return $;
	}

	$.run = function (uri) {
		uri = fmt(uri || location.pathname);
		var obj = routes.find(function (x) {
			return x.pattern.test(uri);
		});
		if (obj) {
			var i=0, params={}, arr=obj.pattern.exec(uri);
			while (i < obj.keys.length) params[obj.keys[i]]=arr[++i] || null;
			handlers[obj[PAT]](params); // todo loop?
		} else if (uri && on404) {
			on404(uri);
		}
		return $;
	}

	$.listen = function () {
		wrap('push');
		wrap('replace');

		function run(e) {
			$.run(e.uri);
		}

		function click(e) {
			var y, x = e.target.closest('a');
			if (!x || !x.href || x.target) return;
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;
			if (y = fmt(x.getAttribute('href'))) {
				e.preventDefault();
				$.route(y);
			}
		}

		var off = removeEventListener;
		addEventListener('popstate', run);
		addEventListener('replacestate', run);
		addEventListener('pushstate', run);
		addEventListener('click', click);

		$.unlisten = function () {
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
	var fn = history[type];
	history[type] = function (uri) {
		var ev = new Event(type.toLowerCase());
		ev.uri = uri;
		fn.apply(this, arguments);
		return dispatchEvent(ev);
	}
}
