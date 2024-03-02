import { CSSProperties } from 'react';

/**
 * @interface IMenuPanel Menu页面的按钮的参数接口
 */
export interface IMenuPanel {
  clickFunc?: any; // 点击事件触发的函数
  buttonOnClassName?: string; // 按钮激活（在当前按钮对应页面）时的className
  tagColor?: string; // 标签颜色
  iconColor?: string; // 图标颜色
  tagName?: string; // 标签显示名称
  iconName: string; // 图标名称
  style?: CSSProperties;
}
