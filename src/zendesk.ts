// @ts-ignore
import playgroundHTML from './playground.html';

type ZendeskConfiguration = {
	subdomain: string;
	messenger_key: string;
	signing_key_id: string;
	signing_key_secret: string;
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
		let htmlPage = await this.generateHTMLPage();

		return new Response(htmlPage, {
			headers: {
				'content-type': 'text/html',
			},
		});
	}

	private async generateHTMLPage(): Promise<string> {
		let zendeskConfig = await this.getZendeskConfig();

		let htmlPage: string = playgroundHTML // Source HTML
			.replace('{{ZD_MESSENGER_KEY}}', zendeskConfig.messenger_key); // Inject the messenger key

		return htmlPage;
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
