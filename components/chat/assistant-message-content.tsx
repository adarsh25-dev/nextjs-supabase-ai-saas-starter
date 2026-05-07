"use client";

import { Code2, Copy, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeOptions,
} from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const chatSanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", "hljs"],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className", /^hljs/],
    ],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className", /^hljs/]],
  },
};

function parseFenceLanguage(className?: string): string | null {
  if (!className) return null;
  const token = className.split(/\s+/).find((part) => part.startsWith("language-"));
  if (!token) return null;
  const raw = token.slice("language-".length).trim().toLowerCase();
  return raw || null;
}

const SHELL_LANGUAGE_LABEL = "Bash";

function codeBlockLanguageLabel(className?: string): string {
  const lang = parseFenceLanguage(className);
  if (!lang) return "Plain text";
  if (lang === "bash" || lang === "sh" || lang === "shell" || lang === "zsh") {
    return SHELL_LANGUAGE_LABEL;
  }
  return lang
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractCodeText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractCodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props;
    return extractCodeText(props?.children);
  }
  return "";
}

function isTrustedHttpUrl(href: string | undefined): boolean {
  if (!href || href.startsWith("#")) return false;
  try {
    const u = new URL(href, "https://example.com");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function markdownComponents(): Components {
  return {
    h1: ({ children, ...props }) => (
      <h1
        {...props}
        className="font-display tracking-[-0.04em] text-[hsl(var(--color-text-primary))]"
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props} className="font-display tracking-[-0.03em] text-[hsl(var(--color-text-primary))]">
        {children}
      </h2>
    ),
    table: ({ children, ...props }) => (
      <div className="my-5 overflow-x-auto rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.35)] shadow-[0_0_40px_-18px_hsl(var(--color-accent)/0.2)]">
        <table {...props} className="w-full min-w-[320px] border-collapse text-left text-[0.9375rem]">
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead {...props} className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-text-primary)/0.06)]">
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th {...props} className="px-3 py-2.5 font-medium text-[hsl(var(--color-text-primary))] md:px-4">
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td {...props} className="border-t border-[hsl(var(--color-border)/0.5)] px-3 py-2.5 text-[hsl(var(--color-text-secondary))] md:px-4">
        {children}
      </td>
    ),
    tr: ({ children, ...props }) => (
      <tr {...props} className="transition-colors duration-200 hover:bg-[hsl(var(--color-text-primary)/0.04)]">
        {children}
      </tr>
    ),
    a: ({ href, children, ...props }) => {
      const external = isTrustedHttpUrl(href ?? undefined);
      return (
        <a
          {...props}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(
            "inline-flex items-center gap-0.5 text-[hsl(var(--color-accent-soft))] underline decoration-[hsl(var(--color-accent-soft)/0.45)] underline-offset-[3px] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[hsl(var(--color-accent))] hover:decoration-[hsl(var(--color-accent)/0.55)]",
            external && "gap-1",
          )}
        >
          {children}
          {external ? <ExternalLink className="size-3 shrink-0 opacity-70" aria-hidden /> : null}
        </a>
      );
    },
    img: ({ src, alt, ...props }) => {
      if (!src || typeof src !== "string") return null;
      const isHttp = isTrustedHttpUrl(src);
      if (!isHttp && !src.startsWith("data:image/")) return null;
      return (
        <span className="my-4 block overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] shadow-[0_12px_48px_-24px_hsl(var(--color-accent)/0.25)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote assistant URLs + data URLs */}
          <img
            {...props}
            src={src}
            alt={alt ?? ""}
            loading="lazy"
            className="max-h-[min(70vh,560px)] w-full object-contain"
          />
        </span>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote
        {...props}
        className="border-l-[3px] border-[hsl(var(--color-accent)/0.45)] bg-[hsl(var(--color-text-primary)/0.04)] py-1 pl-4 pr-3 text-[hsl(var(--color-text-secondary))]"
      >
        {children}
      </blockquote>
    ),
    pre: ({ children }) => {
      const codeChild = Array.isArray(children) ? children[0] : children;
      const className =
        typeof codeChild === "object" &&
        codeChild !== null &&
        "props" in codeChild &&
        typeof (codeChild as { props?: { className?: string } }).props?.className === "string"
          ? (codeChild as { props: { className: string } }).props.className
          : undefined;
      const langLabel = codeBlockLanguageLabel(className);
      const codeText = extractCodeText(children).replace(/\n$/, "");
      return (
        <div
          className={cn(
            "chat-code-block my-6 rounded-2xl border border-[hsl(var(--color-border)/0.35)]",
            "bg-[hsl(var(--color-code-block))] p-4 md:rounded-[1.25rem] md:p-5",
            "shadow-[0_12px_48px_-20px_hsl(var(--color-accent)/0.14)]",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
            <div className="flex min-w-0 items-center gap-2">
              <Code2
                className="size-[1.125rem] shrink-0 text-[hsl(var(--color-text-primary))]"
                strokeWidth={2}
                aria-hidden
              />
              <span className="truncate font-sans text-[0.9375rem] font-semibold text-[hsl(var(--color-text-primary))]">
                {langLabel}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "size-9 shrink-0 rounded-xl",
                "text-[hsl(var(--color-text-primary))]",
                "hover:bg-[hsl(var(--color-text-primary)/0.1)]",
                "focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-code-block))]",
              )}
              aria-label="Copy code"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(codeText);
                  toast.success("Code copied");
                } catch {
                  toast.error("Could not copy to clipboard.");
                }
              }}
            >
              <Copy className="size-4" strokeWidth={2} />
            </Button>
          </div>
          <pre
            className={cn(
              "m-0 overflow-x-auto bg-transparent p-0 font-mono text-[0.8125rem] leading-relaxed tracking-normal",
              "text-[hsl(var(--color-text-primary))] [tab-size:2]",
              "selection:bg-[hsl(var(--color-accent)/0.22)] selection:text-[hsl(var(--color-text-primary))]",
              "[&_code.hljs]:!bg-transparent md:text-[0.84375rem] md:leading-[1.65]",
            )}
          >
            {children}
          </pre>
        </div>
      );
    },
  };
}

type AssistantMessageContentProps = {
  content: string;
};

export function AssistantMessageContent({ content }: AssistantMessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw, rehypeHighlight, [rehypeSanitize, chatSanitizeSchema]]}
      components={markdownComponents()}
    >
      {content}
    </ReactMarkdown>
  );
}
