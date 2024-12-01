// @ts-ignore
import playground from './playground.html';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response(playground, {
			headers: {
				'content-type': 'text/html',
			},
		});
	},
} satisfies ExportedHandler<Env>;
