import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';

// 工具函数：将css字符串转为对象，并返回 feature 字段
function parseCssString(css: string): { styleObj: Record<string, string>; feature?: string } {
  const styleObj: Record<string, string> = {};
  let feature: string | undefined;
  css
    .replace(/[{}]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((item) => {
      const [key, value] = item.split(':').map((s) => s.trim());
      if (key && value) {
        if (key === 'feature') {
          feature = value;
        } else {
          // 驼峰化
          const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          styleObj[camelKey] = value;
        }
      }
    });
  return { styleObj, feature };
}

// 解析HTML元素，提取标签名、属性和内容
interface ParsedElement {
  tagName: string;
  attributes: Record<string, string>;
  innerHTML: string;
  children: ParsedElement[];
}

// 解析HTML属性
function parseAttributes(attrString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex = /(\w+)=\"([^\"]*)\"/g;

  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

// 自动添加绝对定位
function autoAddPositionFixed(style: string): string {
  // 只要有 left/top/width/height 且没有 position，就加上
  if (!/position\s*:/.test(style) && /(left\s*:|top\s*:|right\s*:|bottom\s*:|width\s*:|height\s*:)/.test(style)) {
    // 逗号分隔
    return `position: absolute,pointer-events: none, ${style}`;
  }
  return style;
}
// 将解析后的元素转换为带样式的HTML字符串
// 支持返回 feature 字段
function convertToStyledHtml(elements: ParsedElement[]): { html: string; feature?: string } {
  let feature: string | undefined;
  const html = elements
    .map((element) => {
      let html = `<${element.tagName}`;
      // 处理style属性
      if (element.attributes.style) {
        element.attributes.style = autoAddPositionFixed(element.attributes.style);
        const { styleObj, feature: f } = parseCssString(element.attributes.style);
        if (f && !feature) feature = f;
        const cssString = Object.entries(styleObj)
          .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
          })
          .join('; ');
        html += ` style="${cssString}"`;
      }
      // 处理其他属性
      Object.entries(element.attributes).forEach(([key, value]) => {
        if (key !== 'style') {
          html += ` ${key}="${value}"`;
        }
      });
      html += '>';
      // 添加子元素
      if (element.children.length > 0) {
        const childResult = convertToStyledHtml(element.children);
        html += childResult.html;
        if (childResult.feature && !feature) feature = childResult.feature;
      } else if (element.innerHTML) {
        html += element.innerHTML;
      }
      html += `</${element.tagName}>`;
      return html;
    })
    .join('');
  return { html, feature };
}

// 解析HTML字符串，提取所有元素及其样式
function parseHtmlWithStyles(htmlInput: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // 简单的HTML解析器，处理基本的标签结构
  const tagRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/gs;
  const selfClosingTagRegex = /<(\w+)([^>]*)\/>/gs;

  // 处理自闭合标签
  const processedHtml = htmlInput.replace(selfClosingTagRegex, (match, tagName, attributes) => {
    const attrs = parseAttributes(attributes);
    elements.push({
      tagName,
      attributes: attrs,
      innerHTML: '',
      children: [],
    });
    return match;
  });

  // 处理普通标签
  processedHtml.replace(tagRegex, (match, ...args) => {
    const [tagName, attributes, content] = args;
    const attrs = parseAttributes(attributes);
    const children = parseHtmlWithStyles(content);

    elements.push({
      tagName,
      attributes: attrs,
      innerHTML: content,
      children,
    });
    return match;
  });

  return elements;
}

export const setCustomHtml = (sentence: ISentence): IPerform => {
  console.log('setCustomHtml input:', sentence.content);

  // 检查是否包含HTML标签
  const hasHtmlTags = /<[^>]+>/.test(sentence.content);

  if (!hasHtmlTags) {
    // 如果没有HTML标签，使用原来的格式：<div>内容</div> {样式}
    const match = sentence.content.match(/^(.*)\{(.*)\}$/s);
    if (!match) {
      const removeMatch = sentence.content.match(/^remove\((\d+)\)$/);
      console.log('removeMatch:', removeMatch);
      if (removeMatch) {
        const idx = parseInt(removeMatch[1], 10) - 1 || 0;
        webgalStore.dispatch(stageActions.removeCustomHtml(idx));
        return {
          performName: 'none',
          duration: 0,
          isHoldOn: false,
          stopFunction: () => {},
          blockingNext: () => false,
          blockingAuto: () => true,
          stopTimeout: undefined,
        };
      } else
        return {
          performName: 'none',
          duration: 0,
          isHoldOn: false,
          stopFunction: () => {},
          blockingNext: () => false,
          blockingAuto: () => true,
          stopTimeout: undefined,
        };
    }

    const html = match[1].trim();
    const css = match[2].trim();
    const { styleObj, feature } = parseCssString(css);
    console.log('styleObj:', styleObj);
    console.log('feature:', feature);
    console.log('html:', html);
    console.log('css:', css);

    // 将样式应用到HTML
    const styledHtml = html.replace(/<(\w+)([^>]*)>/g, (match, tagName, attributes) => {
      const cssString = Object.entries(styleObj)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');
      return `<${tagName}${attributes} style="${cssString}">`;
    });

    console.log('Styled HTML:', styledHtml);

    // 添加到状态管理，带 feature 字段
    // 兼容 store/reducer 类型，feature 作为自定义字段传递
    console.log('with feature:', feature);
    webgalStore.dispatch(stageActions.addCustomHtml({ html: styledHtml, _feature: feature }));
  } else {
    // 如果包含HTML标签，直接解析HTML中的样式
    const html = sentence.content.trim();
    console.log('Processing HTML with inline styles:', html);

    // 解析HTML并处理内联样式
    const elements = parseHtmlWithStyles(html);
    const { html: styledHtml, feature } = convertToStyledHtml(elements);
    console.log('feature:', feature);

    console.log('Final styled HTML:', styledHtml, 'feature:', feature);

    // 添加到状态管理，带 feature 字段
    webgalStore.dispatch(stageActions.addCustomHtml({ html: styledHtml, _feature: feature }));
  }

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };
};
