// @ts-ignore
import playground from './playground.html';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let url = new URL(request.url);

		if (url.pathname.startsWith('/zendesk/')) {
			return new Response(playground, {
				headers: {
					'content-type': 'text/html',
				},
			});
		} else {
			return new Response('Supported URL: /zendesk/{subdomain}');
		}
	},
} satisfies ExportedHandler<Env>;
