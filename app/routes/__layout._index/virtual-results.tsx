import { Badge } from "~/components/badge";
import type { SerializeFrom } from "@vercel/remix";
import type { loader } from "./route";
import { useFetcher } from "@remix-run/react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Loader2, Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LIMIT = 10;

const VirtualResults = ({
  data,
  totalResults,
  query,
  entityType,
}: Omit<
  Extract<SerializeFrom<typeof loader>, { status: "searched" }>,
  "status"
>) => {
  const [items, setItems] = useState(data);
  const hasNextPage = items.length < totalResults.value;

  // Calculate window scroll margin top offset
  const parentRef = useRef<HTMLDivElement>(null);
  const parentOffsetRef = useRef(0);
  useEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const virtualizer = useWindowVirtualizer<HTMLLIElement>({
    count: hasNextPage ? items.length + 1 : items.length,
    scrollMargin: parentOffsetRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });
  const virtualItems = virtualizer.getVirtualItems();

  const infiniteScrollFetcher = useFetcher<typeof loader>();

  // Load more items as the user scrolls and reach the end of the scroll container
  const startRef = useRef(LIMIT);
  useEffect(() => {
    const start = startRef.current.toString();
    const lastVirtualItemIndex = [...virtualItems].pop()?.index;
    const lastItemIndex = items.length - 1;

    if (typeof lastVirtualItemIndex !== "number") {
      throw new Error(
        "No results, please avoid rendering the <VirtualResults /> component and point the user towards making another search"
      );
    }

    if (
      hasNextPage &&
      lastVirtualItemIndex >= lastItemIndex &&
      infiniteScrollFetcher.state !== "loading"
    ) {
      infiniteScrollFetcher.load(
        `?${new URLSearchParams({
          query,
          start,
          limit: LIMIT.toString(),
          entityType,
        }).toString()}&index`
      );

      startRef.current += LIMIT;
    }
  }, [
    entityType,
    hasNextPage,
    infiniteScrollFetcher,
    items.length,
    query,
    virtualItems,
  ]);

  // Sync loaded data with our local items state
  useEffect(() => {
    const newData = infiniteScrollFetcher.data;
    if (newData && newData.status === "searched") {
      setItems((prevItems) => [...prevItems, ...newData.data]);
    }
  }, [infiniteScrollFetcher.data]);

  return (
    <div ref={parentRef} className="pb-10">
      <div
        className="relative w-full"
        style={{
          height: virtualizer.getTotalSize(),
        }}
      >
        <ol
          className="absolute -inset-x-2.5 top-0"
          style={{
            transform: `translateY(${
              virtualItems[0].start - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {virtualItems.map((virtualRow) => {
            /*
             * When this loader row is rendered, it means we're reaching the end of the
             * results, so we start fetching more results.
             */
            if (virtualRow.index > items.length - 1) {
              return (
                <li
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  className="flex justify-center p-2.5"
                >
                  <Loader2
                    aria-label="Loading more results..."
                    className="h-4 w-4 animate-spin text-emerald-400"
                  />
                </li>
              );
            }

            const item = items[virtualRow.index];

            return (
              <li key={virtualRow.key} data-index={virtualRow.index}>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-baseline gap-x-2 rounded-lg p-2.5 transition-colors hover:bg-zinc-800"
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
                      className="w-80 rounded-lg border border-zinc-700 bg-zinc-800 p-5 data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all sm:w-96"
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
                              <Badge>{item.subType.join(", ")}</Badge>
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
                          <h2
                            className="truncate font-bold text-zinc-50"
                            title={item.name}
                          >
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
                                <Badge key={keyword} as="li">
                                  {keyword}
                                </Badge>
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
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export { LIMIT, VirtualResults };
