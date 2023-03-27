import { elasticSearchClient } from "~/utils/elastic-search.server";

export const getSearch = ({
  query,
  start,
  limit,
}: {
  query: string;
  start: number;
  limit: number;
}) =>
  elasticSearchClient.search<
    | {
        entity_type: "curation.organization";
        name: string;
        urls: Array<string>;
        about: string | null;
        subtype: Array<string>;
        number_of_connections: number;
      }
    | {
        entity_type: "collection.topic";
        name: string;
        description: string | null;
        keywords: Array<string> | null;
        number_of_connections: number;
      }
  >({
    index: "entities",
    query: {
      bool: {
        must: {
          match: { name: query },
        },
        should: [
          { term: { entity_type: "curation.organization" } },
          { term: { entity_type: "collection.topic" } },
        ],
        minimum_should_match: 1,
      },
    },
    from: start,
    size: limit,
  });
