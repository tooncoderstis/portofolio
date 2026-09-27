import type { ComponentProps } from "react";

export const mdxComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-8 text-xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 text-lg font-semibold" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="text-muted-foreground mt-4 leading-7" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="text-muted-foreground mt-4 list-disc space-y-1 pl-6"
      {...props}
    />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="text-muted-foreground mt-4 list-decimal space-y-1 pl-6"
      {...props}
    />
  ),
  li: (props: ComponentProps<"li">) => <li {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a className="font-medium underline underline-offset-4" {...props} />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="text-foreground font-semibold" {...props} />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="bg-muted rounded px-1.5 py-0.5 text-sm" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="text-muted-foreground mt-4 border-l-2 pl-4 italic"
      {...props}
    />
  ),
};
