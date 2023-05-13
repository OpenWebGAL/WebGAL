import useLanguage from '@/hooks/useLanguage';
import { useEffect } from 'react';

export default function Translation() {
  const setLanguage = useLanguage();

  useEffect(() => setLanguage(Number(window?.localStorage.getItem('lang'))), []);

  return null;
}
