// @ts-ignore
import playgroundHTML from './playground.html';
import jwt from 'jsonwebtoken';

type ZendeskConfiguration = {
	subdomain: string;
	messenger_key: string;
	signing_key_id: string;
	signing_key_secret: string;
};

export default class ZendeskPlayground {
	subdomain: string;
	email: string | null;
	externalId: string | null;
	env: Env;

	constructor(env: Env, url: URL) {
		this.env = env;
		this.email = url.searchParams.get('email');
		this.externalId = url.searchParams.get('user_id');

		if (this.email && !this.externalId) {
			throw new Error(`user_id param required`);
		}

		let extractedSubdomain = url.pathname.split('/')[2];
		if (!extractedSubdomain) {
			throw new Error(`Could not extract subdomain from path: ${url.pathname}`);
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

		if (this.externalId) {
			htmlPage = htmlPage.replace('{{ZD_MESSENGER_USER_AUTH_KEY}}', this.generateAuthToken(zendeskConfig));
		}

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

	private generateAuthToken(zendeskConfig: ZendeskConfiguration): string {
		let payload: any = {
			external_id: this.externalId,
			scope: 'user',
		};

		if (this.email) {
			payload.email = this.email;
			payload.email_verified = true;
		}

		let header = {
			alg: 'HS256',
			typ: 'JWT',
			kid: zendeskConfig.signing_key_id,
		};

		return jwt.sign(payload, zendeskConfig.signing_key_secret, { header });
	}
}
