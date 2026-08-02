'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  title?: string;
}

interface Token {
  type: 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'property';
  value: string;
}

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'new', 'require', 'await', 'async', 'true', 'false', 'null', 'undefined',
  'class', 'import', 'export', 'from', 'typeof', 'this', 'throw', 'try',
  'catch', 'switch', 'case', 'break', 'continue', 'default', 'in', 'of',
  'do', 'delete', 'instanceof', 'void', 'static', 'get', 'set', 'yield',
]);

const PROPERTY_KEYWORDS = new Set([
  'layer_type', 'layer_id', 'object_id', 'page_id', 'transition_id', 'trigger_id',
  'function_id', 'conditional_id', 'loop_id', 'api_call_id', 'api_id', 'boolean_id',
  'collect_id', 'text', 'size', 'colour', 'bold', 'font', 'spacing', 'width',
  'height', 'params', 'body', 'actions', 'check', 'value1', 'value2', 'operator',
  'url', 'method', 'headers', 'timeout', 'port', 'host', 'cors', 'sources',
  'transform', 'validate', 'page_title', 'page_description', 'page_type',
  'page_bg', 'page_url', 'input_method', 'box_length', 'list_elements',
  'start', 'end', 'step', 'condition', 'iterable', 'title', 'description',
  'objects', 'time', 'changes', 'event', 'name', 'email', 'username',
  'password', 'collection', 'schema', 'providers', 'client_id', 'client_secret',
  'secret', 'cookie_name', 'max_age', 'http_only', 'same_site', 'redirect_uri',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const remaining = code.slice(i);

    // Line comment
    const lineComment = remaining.match(/^\/\/[^\n]*/);
    if (lineComment) {
      tokens.push({ type: 'comment', value: lineComment[0] });
      i += lineComment[0].length;
      continue;
    }

    // Block comment
    const blockComment = remaining.match(/^\/\*[\s\S]*?\*\//);
    if (blockComment) {
      tokens.push({ type: 'comment', value: blockComment[0] });
      i += blockComment[0].length;
      continue;
    }

    // String
    const strMatch = remaining.match(/^(['"`])(?:\\.|(?!\1)[\s\S])*\1/);
    if (strMatch) {
      tokens.push({ type: 'string', value: strMatch[0] });
      i += strMatch[0].length;
      continue;
    }

    // Number
    const numMatch = remaining.match(/^\d[\d_.]*/);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    // Identifier
    const identMatch = remaining.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (identMatch) {
      const word = identMatch[0];
      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (PROPERTY_KEYWORDS.has(word)) {
        tokens.push({ type: 'property', value: word });
      } else {
        const after = remaining.slice(word.length).match(/^\s*\(/);
        tokens.push({ type: after ? 'function' : 'plain', value: word });
      }
      i += word.length;
      continue;
    }

    // Whitespace
    const ws = remaining.match(/^\s+/);
    if (ws) {
      tokens.push({ type: 'plain', value: ws[0] });
      i += ws[0].length;
      continue;
    }

    tokens.push({ type: 'plain', value: remaining[0] });
    i += 1;
  }

  return tokens;
}

const tokenClass: Record<Token['type'], string> = {
  plain: 'text-slate-300',
  keyword: 'text-purple-400',
  string: 'text-emerald-400',
  comment: 'text-slate-500 italic',
  number: 'text-amber-400',
  function: 'text-sky-400',
  property: 'text-pink-400',
};

export function CodeBlock({ code, language = 'js', filename, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenize(code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const headerTitle = title || filename || language;

  return (
    <div className="group/code my-6 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14] shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          </span>
          {headerTitle && (
            <span className="ml-2 font-mono text-xs text-white/40">{headerTitle}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">
          {tokens.map((token, index) => (
            <span key={index} className={tokenClass[token.type]}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
