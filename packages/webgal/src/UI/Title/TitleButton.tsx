import React from 'react';
import styles from './title.module.scss';
import useApplyStyle from '@/hooks/useApplyStyle';
import useSoundEffect from '@/hooks/useSoundEffect';
import { PlayOne } from '@icon-park/react';

interface TitleButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  subTitle?: string;
}

/**
 * 标题页按钮组件
 */
const TitleButton: React.FC<TitleButtonProps> = ({
  text,
  onClick,
  disabled = false,
  className = '',
  icon,
  subTitle,
}) => {
  const applyStyle = useApplyStyle('UI/Title/title.scss');
  const { playSeEnter, playSeClick } = useSoundEffect();

  // 基础样式类名
  const buttonClassName = `${applyStyle('Title_button', styles.Title_button)} ${className} ${
    disabled ? styles.Title_button_disabled : ''
  }`;

  // 点击处理函数
  const handleClick = () => {
    if (!disabled) {
      playSeClick();
      onClick();
    }
  };

  return (
    <div className={buttonClassName} onClick={handleClick} onMouseEnter={playSeEnter}>
      {icon && icon}
      <div className={applyStyle('Title_button_text', styles.Title_button_text)}>
        {text}
        {subTitle && (
          <span className={applyStyle('Title_button_subTitle', styles.Title_button_subTitle)}>{subTitle}</span>
        )}
      </div>
    </div>
  );
};

export default TitleButton;
