import styles from './normalSlider.module.scss';
import { ISlider } from '@/UI/Menu/Options/OptionInterface';
import { useEffect, useState, useRef } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

export const NormalSlider = (props: ISlider) => {
  const { playSeEnter } = useSoundEffect();
  const [currentValue, setCurrentValue] = useState(props.initValue);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const applyStyle = useApplyStyle('UI/Menu/Options/normalSlider.scss');

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
  const [bubblePosition, setBubblePosition] = useState(calculateBubblePosition());
  useEffect(() => {
    setBubblePosition(calculateBubblePosition());
  }, [currentValue]);

  const calculatePercent = () => {
    if (!inputRef.current) return 0;
    const min = props.min || 0;
    const max = props.max || 100;
    const ratio = (currentValue - min) / (max - min);
    return ratio * 100;
  };
  const [sliderPercent, setSliderPercent] = useState(calculatePercent());
  useEffect(() => {
    const updateSliderPercent = () => {
      setSliderPercent(calculatePercent());
    };
    updateSliderPercent();
  }, [currentValue]);

  return (
    <div className={applyStyle('options_normal_slider_main', styles.options_normal_slider_main)}>
      <div className={applyStyle('options_normal_slider_track', styles.options_normal_slider_track)}>
        <div
          className={applyStyle('options_normal_slider_fill', styles.options_normal_slider_fill)}
          style={{ width: `${sliderPercent}%` }}
        />
      </div>
      <input
        id={props.uniqueID}
        className={applyStyle('options_normal_slider_input', styles.options_normal_slider_input)}
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
          className={applyStyle('options_normal_slider_bubble', styles.options_normal_slider_bubble)}
          style={{
            left: `${bubblePosition}px`,
          }}
        >
          {Number(currentValue.toFixed(1))}
        </div>
      )}
    </div>
  );
};
