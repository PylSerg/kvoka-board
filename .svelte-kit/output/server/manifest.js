export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.fdhwEXX3.js",app:"_app/immutable/entry/app.BV4fguCr.js",imports:["_app/immutable/entry/start.fdhwEXX3.js","_app/immutable/chunks/Dhp2aY_B.js","_app/immutable/chunks/Dv6m6HPm.js","_app/immutable/entry/app.BV4fguCr.js","_app/immutable/chunks/Dv6m6HPm.js","_app/immutable/chunks/Dj6f-nJM.js","_app/immutable/chunks/DEDqjojZ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
