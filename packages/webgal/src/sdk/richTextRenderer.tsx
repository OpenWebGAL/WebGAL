import type { ReactNode } from 'react';
import { css } from '@emotion/css';
import useEscape from '@/hooks/useEscape';

export interface RichTextToken {
  text: string;
  ruby?: string;
  styleCss?: string;
  styleAllTextCss?: string;
}

export interface RichTextParseOptions {
  lineLimit?: number;
  replaceSpaceWithNbsp?: boolean;
}

export interface RichTextRenderOptions extends RichTextParseOptions {
  isSettled?: boolean;
  charDelayMs?: number;
  charDurationMs?: number;
  revealEndMs?: number;
  prefixNodeCount?: number;
  dialogKey?: string;
  settledClassName?: string;
  animateClassName?: string;
}

interface ParsedSegment {
  text: string;
  ruby?: string;
  styleCss?: string;
  styleAllTextCss?: string;
}

const CJK_REGEX = /[\u4e00-\u9fa5]|[\u0800-\u4e00]|[\uac00-\ud7ff]/;
const PUNCTUATION_REGEX = /[!-\/:-@\[-`{-~\u2000-\u206F\u3000-\u303F\uff00-\uffef]/;

function isCjk(ch: string): boolean {
  return CJK_REGEX.test(ch);
}

export function splitRichTextTokens(sentence: string, replaceSpaceWithNbsp = true): string[] {
  if (!sentence) return [''];
  const words: string[] = [];
  let word = '';
  let cjkFlag = isCjk(sentence[0]);

  for (const ch of sentence) {
    if (ch === ' ' || ch === '\u00a0') {
      if (word) {
        words.push(word);
        word = '';
      }
      words.push(replaceSpaceWithNbsp ? '\u00a0' : ch);
      cjkFlag = false;
      continue;
    }
    if (isCjk(ch) && !PUNCTUATION_REGEX.test(ch)) {
      if (!cjkFlag && word) {
        words.push(word);
        word = '';
      }
      words.push(ch);
      cjkFlag = true;
      continue;
    }
    if (PUNCTUATION_REGEX.test(ch)) {
      if (word) {
        words.push(word + ch);
        word = '';
      } else if (words.length > 0) {
        words[words.length - 1] += ch;
      } else {
        words.push(ch);
      }
      continue;
    }
    if (cjkFlag && word) {
      words.push(word);
      word = '';
    }
    word += ch;
    cjkFlag = false;
  }

  if (word) words.push(word);
  return words;
}

function parseEnhancedArgs(enhanced: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /(\S+)=(.*?)(?=\s+\S+=|\s*$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(enhanced)) !== null) {
    result[match[1]] = match[2].replace(/~/g, ':').trim();
  }
  return result;
}

function parseLineSegments(input: string): ParsedSegment[] {
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|([\s\S]+?(?=\[|$))/g;
  const result: ParsedSegment[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      const text = match[2];
      const enhance = match[3];
      if (/style=|tips=|ruby=|style-alltext=/.test(enhance)) {
        const kv = parseEnhancedArgs(enhance);
        result.push({
          text,
          ruby: kv.ruby,
          styleCss: kv.style,
          styleAllTextCss: kv['style-alltext'],
        });
      } else {
        result.push({ text, ruby: enhance });
      }
    } else {
      result.push({ text: match[0] });
    }
  }
  return result;
}

export function parseRichTextLines(text: string, options: RichTextParseOptions = {}): RichTextToken[][] {
  const { lineLimit, replaceSpaceWithNbsp = true } = options;
  const lines = text.split(/(?<!\\)\|/).map((line) => useEscape(line));
  const parsed = lines.map((line) => {
    const tokens: RichTextToken[] = [];
    for (const seg of parseLineSegments(line)) {
      if (seg.ruby) {
        tokens.push({
          text: seg.text,
          ruby: seg.ruby,
          styleCss: seg.styleCss,
          styleAllTextCss: seg.styleAllTextCss,
        });
      } else {
        for (const ch of splitRichTextTokens(seg.text, replaceSpaceWithNbsp)) {
          tokens.push({
            text: ch,
            styleCss: seg.styleCss,
            styleAllTextCss: seg.styleAllTextCss,
          });
        }
      }
    }
    return tokens;
  });
  return lineLimit !== undefined ? parsed.slice(0, lineLimit) : parsed;
}

export function joinRichTextSegmentLines(
  segments: string[],
  options: RichTextParseOptions = {},
): { lines: RichTextToken[][]; prefixNodeCount: number } {
  const { lineLimit } = options;
  let merged: RichTextToken[][] = [];
  let prefixNodeCount = 0;

  for (const seg of segments) {
    const lines = parseRichTextLines(seg, { ...options, lineLimit: undefined });
    prefixNodeCount = (lineLimit !== undefined ? merged.slice(0, lineLimit) : merged).flat().length;
    if (merged.length === 0) {
      merged = lines;
      continue;
    }
    const [firstLine = [], ...restLines] = lines;
    const joinedLast = [...merged[merged.length - 1], ...firstLine];
    merged = [...merged.slice(0, -1), joinedLast, ...restLines];
  }

  return {
    lines: lineLimit !== undefined ? merged.slice(0, lineLimit) : merged,
    prefixNodeCount,
  };
}

/**
 * Render WebGAL rich text (inline CSS & ruby) with single-layer DOM nodes suitable for `paint-order: stroke fill`.
 */
export function renderRichTextLines(lines: RichTextToken[][], options: RichTextRenderOptions = {}): ReactNode {
  const {
    isSettled = true,
    charDelayMs = 0,
    charDurationMs = 0,
    revealEndMs,
    prefixNodeCount = 0,
    dialogKey = 'rich',
    settledClassName = '',
    animateClassName = '',
  } = options;

  let globalIndex = 0;

  return lines.map((line, lineIndex) => (
    <div key={`${dialogKey}-line-${lineIndex}`}>
      {line.map((token, tokenIndex) => {
        const nodeIndex = globalIndex++;
        const isPrefix = isSettled || nodeIndex < prefixNodeCount || charDelayMs <= 0;
        const delay = (nodeIndex < prefixNodeCount ? nodeIndex : nodeIndex - prefixNodeCount) * charDelayMs;
        const duration =
          revealEndMs === undefined ? charDurationMs : Math.min(charDurationMs, Math.max(0, revealEndMs - delay));

        const inlineClass = [
          token.styleCss ? css(token.styleCss) : '',
          token.styleAllTextCss ? css(token.styleAllTextCss) : '',
        ]
          .filter(Boolean)
          .join(' ');

        const content = token.ruby ? (
          <ruby className={inlineClass || undefined}>
            {token.text}
            <rt>{token.ruby}</rt>
          </ruby>
        ) : (
          token.text
        );

        if (isPrefix) {
          return (
            <span
              key={`${dialogKey}-${lineIndex}-${tokenIndex}`}
              className={`${settledClassName} ${inlineClass}`.trim() || undefined}
            >
              {content}
            </span>
          );
        }

        return (
          <span
            key={`${dialogKey}-${lineIndex}-${tokenIndex}`}
            className={`${animateClassName} ${inlineClass}`.trim() || undefined}
            style={{
              animationDelay: `${delay}ms`,
              animationDuration: `${duration}ms`,
            }}
          >
            {content}
          </span>
        );
      })}
    </div>
  ));
}

export function renderRichText(text: string, options: RichTextRenderOptions = {}): ReactNode {
  const lines = parseRichTextLines(text, options);
  return renderRichTextLines(lines, options);
}
