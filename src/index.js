import convert from 'regexparam';

export default function Navaid(opts) {
	opts = opts || {};
	let base = opts.base || '';
	let routes=[], handlers={}, $=this, PAT='route';

	$.toPath = uri => {
		uri = uri.indexOf(base) == 0 ? uri.substring(base.length) : uri;
		return (uri.charCodeAt(0) == 47) ? uri : '/' + uri;
	}

	$.on = (pat, fn) => {
		handlers[pat] = fn;
		let o = convert(pat);
		o[PAT] = pat;
		routes.push(o);
		return $;
	}

	$.off = (pat) => {
		delete handlers[pat];
		routes = routes.filter(x => x[PAT] !== pat);
		return $;
	}

	$.run = uri => {
		uri = uri || location.pathname;
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
