import useLanguage from '@/hooks/useLanguage';
import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function Translation() {
  const setLanguage = useLanguage();
  const { optionData } = useSelector((state: RootState) => state.userData);

  useEffect(setLanguage, [optionData.language]);

  return null;
}
