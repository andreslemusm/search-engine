import clsx from "clsx";

const colors = {
  // Add more colors as needed
  emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
};

export const Badge = <TElement extends React.ElementType = "span">({
  as,
  children,
  color = "emerald",
  ...elementProps
}: { as?: TElement; color?: keyof typeof colors } & Omit<
  React.ComponentPropsWithoutRef<TElement>,
  "className"
>) => {
  const Element = as ?? "span";

  return (
    <Element
      className={clsx(
        "shrink-0 rounded-full px-2 text-xs font-bold leading-5 ring-1 ring-inset",
        colors[color],
      )}
      {...elementProps}
    >
      {children}
    </Element>
  );
};
