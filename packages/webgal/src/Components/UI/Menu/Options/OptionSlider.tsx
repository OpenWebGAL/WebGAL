import './slider.css';
import { ISlider } from '@/Components/UI/Menu/Options/OptionInterface';
import { useEffect } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';

export const OptionSlider = (props: ISlider) => {
  const { playSeEnter, playSeEnterOptionSlider } = useSoundEffect();
  useEffect(() => {
    setTimeout(() => {
      const input = document.getElementById(props.uniqueID);
      if (input !== null) input.setAttribute('value', props.initValue.toString());
    }, 1);
  }, []);
  return (
    <div className="Option_WebGAL_slider">
      <input
        id={props.uniqueID}
        type="range"
        onChange={props.onChange}
        onFocus={playSeEnterOptionSlider}
        onMouseEnter={playSeEnter}
      />
    </div>
  );
};
