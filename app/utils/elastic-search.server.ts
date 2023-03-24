import { Client } from "@elastic/elasticsearch";

const elasticSearchClient = new Client({
  node: process.env.ES_ENDPOINT,
  auth: {
    username: process.env.ES_USER,
    password: process.env.ES_PASSWORD,
  },
});

export { elasticSearchClient };
