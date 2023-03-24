import { Form } from "@remix-run/react";
import { Fragment } from "react";
import { cacheHeader } from "pretty-cache-header";
import { elasticSearchClient } from "~/utils/elastic-search.server";
import { formatNumberAsCompactNumber } from "~/utils/formatters.server";
import { generateMetaTags } from "~/utils/meta-tags";
import { json } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction as MetaFunction,
} from "@vercel/remix";
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Network, Search as SearchIcon } from "lucide-react";

const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";

  const { hits } = await elasticSearchClient.search<
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
    size: 50,
  });

  return json(
    {
      query,
      totalResults: formatNumberAsCompactNumber(
        typeof hits.total === "number" ? hits.total : hits.total?.value ?? 0
      ),
      data: hits.hits.map((hit) => {
        if (!hit._source) {
          throw new Error("hit without metadata");
        }

        if (hit._source.entity_type === "curation.organization") {
          return {
            id: hit._id,
            name: hit._source.name,
            about: hit._source.about?.trim(),
            urls: hit._source.urls,
            subType: hit._source.subtype,
            numberOfConnections: formatNumberAsCompactNumber(
              hit._source.number_of_connections
            ),
            entityType: hit._source.entity_type,
          };
        }

        return {
          id: hit._id,
          name: hit._source.name,
          description: hit._source.description?.trim(),
          keywords: hit._source.keywords,
          numberOfConnections: formatNumberAsCompactNumber(
            hit._source.number_of_connections
          ),
          entityType: hit._source.entity_type,
        };
      }),
    },
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "1m",
          staleWhileRevalidate: "1month",
        }),
      },
    }
  );
};

const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control": loaderHeaders.get("Cache-Control") ?? "",
});

const meta: MetaFunction<typeof loader> = ({ data }) =>
  generateMetaTags({
    title: `Search: ${data.query} | Search Engine`,
    description: "Find information about organizations and topics",
  });

const Search = () => {
  const { data, query, totalResults } = useLoaderData<typeof loader>();

  return (
    <Fragment>
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-zinc-700 bg-zinc-900/75 backdrop-blur-md">
        {/* Search Bar */}
        <Form action="/" className="w-full max-w-3xl px-4 py-6 lg:py-7">
          <label className="group relative block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon
                className="h-5 w-5 text-zinc-400 transition-colors duration-300 ease-in-out group-focus-within:text-zinc-50"
                aria-label="Search"
              />
            </div>
            <input
              name="query"
              className="block w-full rounded-xl border border-transparent bg-transparent py-2.5 pl-10 pr-3 text-zinc-50 placeholder-zinc-400 transition-colors duration-300 ease-in-out hover:bg-zinc-800 focus:border-emerald-500 focus:bg-transparent focus:placeholder-zinc-500 focus:outline-none"
              placeholder="Search for an organization or topic..."
              defaultValue={query}
            />
          </label>
        </Form>
      </header>
      <main className="mx-auto w-full max-w-3xl px-8 lg:px-8">
        <p className="pt-2.5 text-base text-zinc-400">
          We found{" "}
          <strong className="font-bold text-emerald-400">{totalResults}</strong>{" "}
          results
        </p>
        <ol className="-mx-2.5 flex flex-col divide-y divide-zinc-700 pt-4">
          {data.map((item) => (
            <li key={item.id}>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-baseline gap-x-2 p-2.5 transition-colors hover:bg-zinc-800"
                  >
                    <span className="truncate text-base text-zinc-100">
                      {item.name}
                    </span>
                    <span className="text-sm text-zinc-400">
                      (
                      {
                        {
                          "curation.organization": "Organization",
                          "collection.topic": "Topic",
                        }[item.entityType]
                      }
                      )
                    </span>
                  </button>
                </HoverCardTrigger>
                <HoverCardPortal>
                  <HoverCardContent
                    className="w-96 rounded-lg border border-zinc-700 bg-zinc-800 px-5 pt-3 pb-4 shadow data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all"
                    sideOffset={5}
                  >
                    {item.entityType === "curation.organization" ? (
                      <article>
                        <header className="flex items-baseline justify-between gap-x-2">
                          <h2
                            className="truncate font-bold text-zinc-50"
                            title={item.name}
                          >
                            {item.name}
                          </h2>
                          {item.subType.length > 0 ? (
                            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 text-xs font-bold leading-5 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                              {item.subType.join(", ")}
                            </span>
                          ) : null}
                        </header>
                        {item.urls.length > 0 ? (
                          <div className="truncate text-sm text-zinc-300">
                            <a
                              className="hover:underline"
                              href={item.urls[0]}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.urls[0].replace(/https?:\/\/(www.)?/, "")}
                            </a>
                          </div>
                        ) : null}
                        {item.about ? (
                          <p className="pt-3 text-sm text-zinc-50 line-clamp-3">
                            {item.about}
                          </p>
                        ) : null}
                        <p className="flex items-center gap-x-1.5 pt-3 text-sm text-zinc-300">
                          <Network className="h-4 w-4 text-zinc-400" />
                          {item.numberOfConnections} Conections
                        </p>
                      </article>
                    ) : (
                      <article>
                        <h2 className="truncate font-bold text-zinc-50">
                          {item.name}
                        </h2>
                        {item.description ? (
                          <p className="pt-3 text-sm text-zinc-50 line-clamp-3">
                            {item.description}
                          </p>
                        ) : null}
                        <p className="flex items-center gap-x-1.5 pt-3 text-sm text-zinc-300">
                          <Network className="h-4 w-4 text-zinc-400" />
                          {item.numberOfConnections} Conections
                        </p>
                        {Array.isArray(item.keywords) &&
                        item.keywords.length > 0 ? (
                          <ul className="flex flex-wrap items-center gap-1.5 pt-3">
                            {item.keywords.map((keyword) => (
                              <li
                                key={keyword}
                                className="shrink-0 rounded-full bg-emerald-500/10 px-2 text-xs font-bold leading-5 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                              >
                                {keyword}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    )}
                    <HoverCardArrow className="fill-zinc-700" />
                  </HoverCardContent>
                </HoverCardPortal>
              </HoverCard>
            </li>
          ))}
        </ol>
      </main>
    </Fragment>
  );
};

export { meta, loader, headers };
export default Search;
