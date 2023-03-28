import { Fragment } from "react";
import { cacheHeader } from "pretty-cache-header";
import clsx from "clsx";
import type { entityTypeFilters } from "~/services/search.server";
import { formatNumberAsCompactNumber } from "~/utils/formatters.server";
import { generateMetaTags } from "~/utils/meta-tags";
import { getSearch } from "~/services/search.server";
import { json } from "@vercel/remix";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction as MetaFunction,
} from "@vercel/remix";
import { LIMIT, VirtualResults } from "./virtual-results";
import { Link, useLoaderData } from "@remix-run/react";
import { undrawSearching, undrawVoid } from "~/assets";

const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("query");
  const start = Number(searchParams.get("start") ?? 0);
  const entityType = searchParams.get("entityType") ?? "all";

  if (!query) {
    return json(
      { status: "idle" as const },
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
  }

  const { hits } = await getSearch({
    query,
    start,
    limit: LIMIT,
    // This is a mistake, you should use library like zod for checking data on the server
    entityType: entityType as keyof typeof entityTypeFilters,
  });

  return json(
    {
      status: "searched" as const,
      query,
      entityType,
      totalResults: {
        label: formatNumberAsCompactNumber(
          typeof hits.total === "number" ? hits.total : hits.total?.value ?? 0
        ),
        value:
          typeof hits.total === "number" ? hits.total : hits.total?.value ?? 0,
      },
      data: hits.hits.map((hit) => {
        if (!hit._source) {
          throw new Error(
            "hit without data, please review the appropiate way to handle this case"
          );
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
    title:
      data.status === "idle"
        ? "Search Engine"
        : `${data.query} | Search Engine`,
    description: "Find information about organizations and topics",
  });

const Search = () => {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.status === "searched") {
    return (
      <Fragment>
        <nav className="flex items-center gap-x-5 border-b border-zinc-800 py-5">
          {entityTypes.map(({ entityType, label }) => (
            <Link
              key={entityType}
              to={{
                search: new URLSearchParams({
                  query: loaderData.query,
                  entityType,
                }).toString(),
              }}
              className={clsx(
                entityType === loaderData.entityType
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-400 hover:text-zinc-200",
                "shrink-0 rounded-lg px-3 py-2 text-sm font-bold  transition"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {loaderData.totalResults.value > 0 ? (
          <Fragment>
            <p className="pt-6 pb-8 text-zinc-400">
              We found{" "}
              <span className="font-bold text-emerald-400">
                {loaderData.totalResults.label}
              </span>{" "}
              results for &quot;{loaderData.query}&quot;
            </p>
            <VirtualResults
              data={loaderData.data}
              query={loaderData.query}
              totalResults={loaderData.totalResults}
              entityType={loaderData.entityType}
              // This is to avoid more complex sync logic inside VirtualResults
              key={loaderData.query + loaderData.entityType}
            />
          </Fragment>
        ) : (
          <Fragment>
            <div className="flex flex-col items-center justify-center pt-32">
              <img
                className="h-48 w-auto"
                src={undrawVoid}
                alt="Man looking a void"
                width={143}
                height={150}
              />
              <p className="mt-6 text-lg font-bold text-zinc-50">
                No results found
              </p>
              <p className="mt-2 text-center text-zinc-300">
                We couldn&apos;t found any matches for &quot;{loaderData.query}
                &quot;. <br /> Please try making another search or removing any
                filters.
              </p>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-32">
      <img
        className="h-48 w-auto"
        src={undrawSearching}
        alt="Woman organizing blocks on a UI"
        width={161}
        height={150}
      />
      <h1 className="mt-6 text-center text-lg font-bold text-zinc-50">
        What are you searching for?
      </h1>
      <p className="mt-2 text-center text-zinc-300">
        Search for your favorite topic or organization.
      </p>
    </div>
  );
};

const entityTypes = [
  {
    entityType: "all",
    label: "All",
  },
  {
    entityType: "curation.organization",
    label: "Organization",
  },
  {
    entityType: "collection.topic",
    label: "Topic",
  },
] satisfies Array<{
  entityType: keyof typeof entityTypeFilters;
  label: string;
}>;

export { meta, loader, headers };
export default Search;
