require('dotenv').config();
import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

// https://mariosfakiolas.com/blog/manage-environment-variables-in-a-sapper-application/

const { PORT, NODE_ENV, SANITY_TOKEN } = process.env;
const dev = NODE_ENV === 'development';

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
			session: () => ({
        SANITY_TOKEN,
      }),
		})
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
