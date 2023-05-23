import { DependencyList, useEffect, useState } from 'react';

export default function useNotFirstEffect(callback: () => void, deps: DependencyList) {
  const [firstly, setFirstly] = useState<boolean>(false);

  useEffect(() => {
    setFirstly(true);
    if (firstly) callback();
  }, deps);
}
