import convert from 'regexparam';

export default function Navaid(opts) {
	opts = opts || {};
	let routes=[], handlers={}, $=this;

	let base = opts.base || opts.history ? '/' : location.pathname;
	let baselen = base.length;

	$.toPath = uri => {
		return uri.indexOf(base) === 0 ? uri.substring(baselen) || '/' : uri;
	}

	$.on = (pat, fn) => {
		handlers[pat] = fn;
		let o = convert(pat);
		o.old = pat;
		routes.push(o);
		return $;
	}

	$.off = (pat) => {
		delete handlers[pat];
		routes = routes.filter(x => x.old !== pat);
		return $;
	}

	$.run = uri => {
		uri = uri || location.pathname;
		let obj = routes.find(x => x.pattern.test(uri));
		if (obj) {
			let i=0, params={}, arr=obj.pattern.exec(uri);
			while (i < obj.keys.length) params[obj.keys[i]]=arr[++i] || null;
			handlers[obj.old](params); // todo loop?
		}
		return $;
	}

	return $;
}
