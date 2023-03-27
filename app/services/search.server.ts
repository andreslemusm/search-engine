import { elasticSearchClient } from "~/utils/elastic-search.server";

const entityTypeFilters = {
  all: [
    { term: { entity_type: "curation.organization" } },
    { term: { entity_type: "collection.topic" } },
  ],
  "curation.organization": [{ term: { entity_type: "curation.organization" } }],
  "collection.topic": [{ term: { entity_type: "collection.topic" } }],
};

const getSearch = ({
  query,
  start,
  limit,
  entityType,
}: {
  query: string;
  start: number;
  limit: number;
  entityType: keyof typeof entityTypeFilters;
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
        should: entityTypeFilters[entityType],
        minimum_should_match: 1,
      },
    },
    from: start,
    size: limit,
  });

export { entityTypeFilters, getSearch };
