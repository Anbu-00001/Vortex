import { GraphQLClient } from 'graphql-request';

class MissingTokenError extends Error {
  constructor() {
    super('GITHUB_TOKEN environment variable is required');
    this.name = 'MissingTokenError';
  }
}

const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new MissingTokenError();
}

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    authorization: `Bearer ${token}`,
  },
});

export { client };