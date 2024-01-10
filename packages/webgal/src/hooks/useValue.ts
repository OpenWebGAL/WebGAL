import { useState } from 'react';

export function useValue<T>(initialState: T) {
  const [value, setValue] = useState<T>(initialState);
  return {
    _value: value,
    set: function (newValue: T) {
      this._value = newValue;
      setValue(newValue);
    },
    get value() {
      return this._value;
    },
    set value(newValue) {
      this.set(newValue);
    },
  };
}
