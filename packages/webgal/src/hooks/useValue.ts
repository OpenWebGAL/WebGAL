import { useState } from 'react';

export function useValue<T>(initialState: T) {
  const [value, setValue] = useState(initialState);
  return {
    value,
    set: function (newValue: any) {
      this.value = newValue;
      setValue(newValue);
    },
  };
}
