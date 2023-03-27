import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { Form, Outlet, useNavigation, useSearchParams } from "@remix-run/react";
import { Loader2, Search as SearchIcon } from "lucide-react";

const Layout = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const navigation = useNavigation();

  return (
    <Fragment>
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-zinc-800 bg-zinc-900/75 backdrop-blur-md">
        {/* Search Bar */}
        <Form
          action="/"
          className="relative mx-4 my-6 w-full max-w-3xl lg:my-7"
        >
          <label className="group relative block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon
                className="h-5 w-5 text-zinc-400 transition-colors duration-300 ease-in-out group-focus-within:text-zinc-50"
                aria-label="Search"
              />
            </div>
            <input
              type="text"
              name="query"
              className="block w-full rounded-xl border border-transparent bg-transparent py-2.5 pl-10 pr-3 text-zinc-50 placeholder-zinc-400 transition-colors duration-300 ease-in-out hover:bg-zinc-800 focus:border-emerald-500 focus:bg-transparent focus:placeholder-zinc-500 focus:ring-0"
              placeholder="Search for an organization or topic..."
              defaultValue={query}
              autoComplete="off"
            />
          </label>
          <Transition
            as="div"
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
            show={navigation.state === "loading"}
            enter="transition-opacity duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Loader2
              className="h-5 w-5 animate-spin text-emerald-400 transition-opacity"
              aria-label="Searching..."
            />
          </Transition>
        </Form>
      </header>
      <main className="mx-auto w-full max-w-3xl px-8 lg:px-8">
        <Outlet />
      </main>
    </Fragment>
  );
};

export default Layout;
