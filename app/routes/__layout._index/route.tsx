import { Fragment } from "react";
import { cacheHeader } from "pretty-cache-header";
import { formatNumberAsCompactNumber } from "~/utils/formatters.server";
import { generateMetaTags } from "~/utils/meta-tags";
import { getSearch } from "~/services/search.server";
import { json } from "@vercel/remix";
import { useLoaderData } from "@remix-run/react";
import type {
  HeadersFunction,
  LoaderArgs,
  V2_MetaFunction as MetaFunction,
} from "@vercel/remix";
import { LIMIT, VirtualResults } from "./virtual-results";
import { undrawSearching, undrawVoid } from "~/assets";

const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("query");
  const start = Number(searchParams.get("start") ?? 0);

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

  const { hits } = await getSearch({ query, start, limit: LIMIT });

  return json(
    {
      status: "searched" as const,
      query,
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
        : `Search: ${data.query} | Search Engine`,
    description: "Find information about organizations and topics",
  });

const Search = () => {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.status === "searched" && loaderData.totalResults.value > 0) {
    return (
      <Fragment>
        <p className="pt-6 pb-8 text-zinc-400">
          We found{" "}
          <span className="font-bold text-emerald-400">
            {loaderData.totalResults.label}
          </span>{" "}
          results for &quot;{loaderData.query}&quot;
        </p>
        <VirtualResults
          key={loaderData.query}
          data={loaderData.data}
          query={loaderData.query}
          totalResults={loaderData.totalResults}
        />
      </Fragment>
    );
  }

  if (loaderData.status === "searched") {
    return (
      <div className="flex flex-col items-center justify-center pt-32">
        <img
          className="h-48 w-auto"
          src={undrawVoid}
          alt="Man looking a void"
          width={143}
          height={150}
        />
        <p className="mt-6 text-lg font-bold text-zinc-50">No results found</p>
        <p className="mt-2 text-center text-zinc-300">
          &quot;{loaderData.query}&quot; did not matched any organization or
          topic. <br /> Please try making another search.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-32">
      <img
        className="h-48 w-auto"
        src={undrawSearching}
        alt="Women organizing blocks on a UI"
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

export { meta, loader, headers };
export default Search;
