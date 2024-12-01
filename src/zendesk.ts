// @ts-ignore
import playground from './playground.html';

type ZendeskConfiguration = {
	subdomain: string;
	signingKeyID: string;
	signingKeySecret: string;
};

export default class ZendeskPlayground {
	subdomain: string;
	url: URL;
	env: Env;

	constructor(env: Env, url: URL) {
		this.env = env;
		this.url = url;
		let extractedSubdomain = this.url.pathname.split('/')[2];

		if (!extractedSubdomain) {
			throw new Error(`Could not extract subdomain from path: ${this.url.pathname}`);
		} else {
			this.subdomain = extractedSubdomain;
		}
	}

	async generatePage(): Promise<Response> {
		let zendeskConfig = await this.getZendeskConfig();

		return new Response(playground, {
			headers: {
				'content-type': 'text/html',
			},
		});
	}

	private async getZendeskConfig(): Promise<ZendeskConfiguration> {
		const { results } = await this.env.DB.prepare('SELECT * FROM zendesk_configurations WHERE subdomain = ?')
			.bind(this.subdomain)
			.all<ZendeskConfiguration>();

		if (results.length === 0) {
			throw new Error(`Could not find configuration for Zendesk subdomain "${this.subdomain}"`);
		}

		return results[0];
	}
}
