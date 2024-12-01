import ZendeskPlayground from './zendesk';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		let url = new URL(request.url);

		if (url.pathname.startsWith('/zendesk')) {
			return new ZendeskPlayground(env, url).generatePage();
		} else {
			return new Response('Supported URL: /zendesk/{subdomain}');
		}
	},
} satisfies ExportedHandler<Env>;
