import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';

// 工具函数：将css字符串转为对象
function parseCssString(css: string): Record<string, string> {
  const styleObj: Record<string, string> = css
    .replace(/[{}]/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const [key, value] = item.split(':').map((s) => s.trim());
      if (key && value) {
        // 驼峰化
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        acc[camelKey] = value;
      }
      return acc;
    }, {});
  return styleObj;
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
    return `position: fixed,pointer-events: none, ${style}`;
  }
  return style;
}
// 将解析后的元素转换为带样式的HTML字符串
function convertToStyledHtml(elements: ParsedElement[]): string {
  return elements
    .map((element) => {
      let html = `<${element.tagName}`;

      // 处理style属性
      if (element.attributes.style) {
        element.attributes.style = autoAddPositionFixed(element.attributes.style);
        // 将驼峰化的CSS属性转换回CSS格式
        const styleObj = parseCssString(element.attributes.style);
        const cssString = Object.entries(styleObj)
          .map(([key, value]) => {
            // 将驼峰化转换回CSS格式
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
        html += convertToStyledHtml(element.children);
      } else if (element.innerHTML) {
        html += element.innerHTML;
      }

      html += `</${element.tagName}>`;

      return html;
    })
    .join('');
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
    const styleObj = parseCssString(css);
    console.log('styleObj:', styleObj);
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

    // 添加到状态管理
    webgalStore.dispatch(stageActions.addCustomHtml({ html: styledHtml }));
  } else {
    // 如果包含HTML标签，直接解析HTML中的样式
    const html = sentence.content.trim();
    console.log('Processing HTML with inline styles:', html);

    // 解析HTML并处理内联样式
    const elements = parseHtmlWithStyles(html);
    const styledHtml = convertToStyledHtml(elements);

    console.log('Final styled HTML:', styledHtml);

    // 添加到状态管理
    webgalStore.dispatch(stageActions.addCustomHtml({ html: styledHtml }));
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
