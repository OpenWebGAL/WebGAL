import useLanguage from '@/hooks/useLanguage';
import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

let inited = -2;

export default function Translation() {
  const setLanguage = useLanguage();
  const { optionData } = useSelector((state: RootState) => state.userData);

  useEffect(() => {
    // 防止初始化后调用
    inited++;
    if (inited) return;
    setLanguage();
  }, [optionData.language]);

  return null;
}
