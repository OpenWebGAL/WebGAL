import './slider.css';
import { ISlider } from '@/UI/Menu/Options/OptionInterface';
import { useEffect, useState, useRef } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';

export const OptionSlider = (props: ISlider) => {
  const { playSeEnter } = useSoundEffect();
  const [currentValue, setCurrentValue] = useState(props.initValue);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    setCurrentValue(props.initValue);
  }, [props.initValue]);

  const calculateBubblePosition = () => {
    if (!inputRef.current) return 0;
    const input = inputRef.current;
    const min = props.min || 0;
    const max = props.max || 100;
    const ratio = (currentValue - min) / (max - min);
    const sliderWidth = input.offsetWidth;
    const thumbWidth = sliderWidth * 0.072;
    return ratio * (sliderWidth - thumbWidth) + thumbWidth / 2;
  };

  return (
    <div className="Option_WebGAL_slider">
      <input
        id={props.uniqueID}
        ref={inputRef}
        type="range"
        value={currentValue}
        min={props.min}
        max={props.max}
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          setCurrentValue(value);
          props.onChange(e);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !isDragging && setIsHovered(false)}
        onMouseDown={() => setIsDragging(true)}
        onFocus={playSeEnter}
        onMouseOver={playSeEnter}
        onTouchStart={() => {
          setIsDragging(true);
          setIsHovered(true);
        }}
        onTouchEnd={() => {
          setIsDragging(false);
          setIsHovered(false);
        }}
      />
      {(isHovered || isDragging) && (
        <div
          className="bubble"
          style={{
            left: `${calculateBubblePosition()}px`,
          }}
        >
          {Number(currentValue.toFixed(1))}
        </div>
      )}
    </div>
  );
};
