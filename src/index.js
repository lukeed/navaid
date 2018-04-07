import filter from '@arr/filter';
import { exec, match, parse } from 'matchit';

export default function Navaid(opts) {
	opts = opts || {};
	let routes=[], handlers={}, $=this;

	let base = opts.base || opts.history ? '/' : location.pathname;
	let baselen = base.length;

	$.toPath = str => {
		return str.indexOf(base) === 0 ? str.substring(baselen) || '/' : str;
	}

	$.on = (uri, fn) => {
		handlers[uri] = fn;
		routes.push(parse(uri));
		return $;
	}

	$.off = (uri) => {
		delete handlers[uri];
		routes = filter(routes, x => x.old !== uri);
		return $;
	}

	$.find = uri => {
		let arr = match(uri, routes);
		if (arr.length === 0) return false;
		return {
			params: exec(uri, arr),
			handler: handlers[arr[0].old]
		};
	}

	$.run = uri => {
		let obj = $.find(uri);
		if (obj) obj.handler(obj.params);
		return $;
	}

	return $;
}
