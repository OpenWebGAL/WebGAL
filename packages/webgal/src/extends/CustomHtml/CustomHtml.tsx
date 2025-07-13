import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import styles from './customHtml.module.scss';
import { createPortal } from 'react-dom';

export const CustomHtml: FC = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const { customHtml } = stageState;
  if (!customHtml || customHtml.length === 0) {
    return null;
  }
  return createPortal(
    <div className={styles.customHtmlContainer} data-testid="custom-html-container">
      {customHtml.map((html, index) => (
        <div
          key={`custom-html-${index}`}
          className={styles.customHtmlItem}
          data-testid={`custom-html-item-${index}`}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ position: 'absolute', zIndex: 1000 + index }}
        />
      ))}
    </div>,
    document.body,
  );
};
