import { GraphQLClient } from 'graphql-request';

class MissingTokenError extends Error {
  constructor() {
    super('GITHUB_TOKEN environment variable is required');
    this.name = 'MissingTokenError';
  }
}

let client: GraphQLClient | null = null;

function getClient(): GraphQLClient {
  if (!client) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new MissingTokenError();
    }

    client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }
  return client;
}

export { getClient };