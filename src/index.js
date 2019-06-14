import convert from 'regexparam';

export default function Navaid(base, on404) {
	var rgx, routes=[], $={};

	var fmt = $.format = function (uri) {
		if (!uri) return uri;
		uri = '/' + uri.replace(/^\/|\/$/g, '');
		return rgx ? rgx.test(uri) && (uri.replace(rgx, '') || '/') : uri;
	}

	base = fmt(base || '');
	if (base === '/') base = '';
	if (base) rgx = new RegExp('^/?' + base.substring(1) + '(?=/|$)', 'i');

	$.route = function (uri, replace) {
		history[(replace ? 'replace' : 'push') + 'State'](base + uri, null, base + uri);
	}

	$.on = function (pat, fn) {
		(pat = convert(pat)).fn = fn;
		routes.push(pat);
		return $;
	}

	$.run = function (uri) {
		var i=0, params={}, arr, obj;
		if (uri = fmt(uri || location.pathname)) {
			uri = uri.match(/[^\?#]*/)[0];
			for (; i < routes.length; i++) {
				if (arr = (obj=routes[i]).pattern.exec(uri)) {
					for (i=0; i < obj.keys.length;) {
						params[obj.keys[i]] = arr[++i] || null;
					}
					obj.fn(params); // todo loop?
					return $;
				}
			}
			if (on404) on404(uri);
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
			if (!x || !x.href || x.target || x.host !== location.host) return;
			if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;
			if (y = fmt(x.getAttribute('href'))) {
				e.preventDefault();
				$.route(y);
			}
		}

		addEventListener('popstate', run);
		addEventListener('click', click);

		$.unlisten = function () {
			removeEventListener('popstate', run);
			removeEventListener('click', click);
		}

		return $.run();
	}

	return $;
}

function wrap(type, fn) {
	if (history[type]) return;
	history[type] = type;
	fn = history[type += 'State'];
	history[type] = function (uri) {
		var ev = new Event(type.toLowerCase());
		ev.uri = uri;
		fn.apply(this, arguments);
		return dispatchEvent(ev);
	}
}
