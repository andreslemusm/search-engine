import { Analytics } from "@vercel/analytics/react";
import type { LinksFunction } from "@vercel/remix";
import styles from "./styles/index.output.css";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

const links: LinksFunction = () => [
  // Favicons
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
  // Lato 400, 700
  {
    as: "font",
    crossOrigin: "anonymous",
    href: "https://fonts.gstatic.com/s/lato/v23/S6uyw4BMUTPHjx4wXg.woff2",
    rel: "preload",
    type: "font/woff2",
  },
  {
    as: "font",
    crossOrigin: "anonymous",
    href: "https://fonts.gstatic.com/s/lato/v23/S6u9w4BMUTPHh6UVSwiPGQ.woff2",
    rel: "preload",
    type: "font/woff2",
  },
  // Stylesheets
  { rel: "stylesheet", href: styles },
];

const App = () => (
  <html lang="en">
    <head>
      <Meta />
      <Links />
    </head>
    <body className="flex flex-col bg-zinc-900 antialiased">
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
      <Analytics />
    </body>
  </html>
);

export { links };
export default App;
