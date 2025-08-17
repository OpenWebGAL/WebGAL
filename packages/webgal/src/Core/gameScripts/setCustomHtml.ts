import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';
import React from 'react';

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

// 解析CSS样式字符串为React.CSSProperties对象
function parseStyleStringToCSSProperties(styleStr: string): React.CSSProperties {
  const style: Record<string, string> = {};
  // 分割样式属性
  const properties = styleStr.split(';');

  properties.forEach((prop) => {
    const [key, value] = prop.split(':').map((s) => s.trim());
    if (key && value) {
      // 转换为驼峰命名
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      style[camelKey] = value;
    }
  });

  return style;
}

// 解析HTML元素，提取标签名、属性和内容
interface ParsedElement {
  tagName: string;
  attributes: Record<string, string>;
  innerHTML: string;
  children: ParsedElement[];
  selfClosing: boolean; // 标记是否为自闭合标签
}

// 自动添加绝对定位
function autoAddPositionAbsolute(style: string): string {
  // 只要有 left/top/width/height 且没有 position，就加上
  if (!/position\s*:/.test(style) && /(left\s*:|top\s*:|right\s*:|bottom\s*:|width\s*:|height\s*:)/.test(style)) {
    // 逗号分隔
    return `position: absolute,pointer-events: none, ${style}`;
  }
  return style;
}

// 将单个解析后的元素转换为带样式的HTML字符串
// 支持返回 feature 字段
function convertElementToStyledHtml(element: ParsedElement): { html: string; feature?: string } {
  let feature: string | undefined;
  let html = `<${element.tagName}`;

  // 处理style属性
  if (element.attributes.style) {
    element.attributes.style = autoAddPositionAbsolute(element.attributes.style);
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

  // 处理其他属性，但过滤掉所有on*事件处理器以防止XSS
  Object.entries(element.attributes).forEach(([key, value]) => {
    // 禁止所有on*事件处理器属性，防止XSS攻击
    if (key !== 'style' && !key.startsWith('on')) {
      html += ` ${key}="${value}"`;
    }
  });

  // 处理自闭合标签
  if (element.selfClosing) {
    html += '/>';
  } else {
    html += '>';
    // 添加子元素
    if (element.children.length > 0) {
      // 递归处理所有子元素
      const childResults = element.children.map((child) => convertElementToStyledHtml(child));
      html += childResults
        .map((result) => {
          if (result.feature && !feature) feature = result.feature;
          return result.html;
        })
        .join('');
    } else if (element.innerHTML) {
      html += element.innerHTML;
    }
    html += `</${element.tagName}>`;
  }

  return { html, feature };
}

// 解析HTML字符串，提取所有元素及其样式
function parseHtmlWithStyles(htmlInput: string): ParsedElement[] {
  // 使用DOMParser解析HTML字符串，更加安全和可靠
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlInput, 'text/html');

  // 递归遍历节点并转换为ParsedElement结构
  function parseNode(node: Node): ParsedElement[] {
    const elements: ParsedElement[] = [];

    // 遍历所有子节点
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        const attributes: Record<string, string> = {};

        // 提取所有属性
        for (const attr of element.attributes) {
          attributes[attr.name] = attr.value;
        }

        // 判断是否为自闭合标签
        const selfClosingTags = [
          'img',
          'br',
          'hr',
          'input',
          'link',
          'meta',
          'area',
          'base',
          'col',
          'embed',
          'source',
          'track',
          'wbr',
        ];
        const isSelfClosing =
          selfClosingTags.includes(tagName) || (element.childNodes.length === 0 && !element.textContent);

        // 递归处理子元素（如果不是自闭合标签）
        const children = isSelfClosing ? [] : parseNode(element);

        // 获取innerHTML内容
        let innerHTML = '';
        if (children.length === 0 && !isSelfClosing) {
          innerHTML = element.innerHTML;
        }

        elements.push({
          tagName,
          attributes,
          innerHTML,
          children,
          selfClosing: isSelfClosing,
        });
      }
    });

    return elements;
  }

  // 从body开始解析（因为DOMParser会自动包装HTML）
  return parseNode(doc.body);
}

export const setCustomHtml = (sentence: ISentence): IPerform => {
  const removeMatch = sentence.content.match(/^remove\((\d+)\)$/);
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
  }

  // 直接解析HTML中的样式（不再支持<div>content</div> {css}格式）
  const html = sentence.content.trim();

  // 解析HTML并处理内联样式
  const elements = parseHtmlWithStyles(html);

  // 为每个元素单独处理和分发action
  elements.forEach((element) => {
    const { html: styledHtml, feature } = convertElementToStyledHtml(element);

    // 直接从元素的attributes中提取样式，避免再次解析HTML字符串
    let style: React.CSSProperties = { position: 'absolute' };
    if (element.attributes.style) {
      const processedStyle = autoAddPositionAbsolute(element.attributes.style);
      const { styleObj } = parseCssString(processedStyle);
      // 将styleObj转换为React.CSSProperties
      Object.keys(styleObj).forEach((key) => {
        // 使用类型断言来避免TypeScript错误
        (style as any)[key] = styleObj[key];
      });
    }

    // 添加到状态管理，带 feature 字段和style对象
    webgalStore.dispatch(stageActions.addCustomHtml({ html: styledHtml, _feature: feature, style }));
  });

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
