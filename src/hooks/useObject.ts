import {useState} from "react";

export function useObject(initialState: any) {
  const [value, setValue] = useState(initialState);
  return {
    value,
    set: function (newValue: any) {
      this.value = newValue;
      setValue(newValue);
    }
  };
}
