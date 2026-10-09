import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mt-6 text-xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-8 text-lg font-semibold tracking-tight" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 text-base font-semibold" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mt-3 leading-7" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="mt-3 list-disc space-y-1 pl-6" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="mt-3 list-decimal space-y-1 pl-6" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-primary font-medium underline underline-offset-4"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="bg-muted rounded px-1.5 py-0.5 text-xs" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="bg-muted mt-3 overflow-x-auto rounded-md p-3 text-xs"
      {...props}
    />
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th className="border-border border-b px-3 py-2 font-semibold" {...props} />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-border border-b px-3 py-2 align-top" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="text-muted-foreground mt-3 border-l-2 pl-4 italic"
      {...props}
    />
  ),
};

export function MarkdownView({ markdown }: { markdown: string | null }) {
  if (!markdown || markdown.trim() === "") {
    return <p className="text-muted-foreground text-sm">Belum ada dokumen.</p>;
  }

  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
