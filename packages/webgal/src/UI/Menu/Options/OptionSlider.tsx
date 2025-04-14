import './slider.css';
import { ISlider } from '@/UI/Menu/Options/OptionInterface';
import { useEffect, useState, useRef, useCallback } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import { SlidingHorizontal, Sort } from '@icon-park/react';

export const OptionSlider = (props: ISlider) => {
  const { playSeEnter, playSeClick } = useSoundEffect();
  const [currentValue, setCurrentValue] = useState(props.initValue);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const lastUpdateTime = useRef(0);

  // 计算百分比 - 使用useCallback缓存函数
  const getPercentValue = useCallback(() => {
    const min = props.min || 0;
    const max = props.max || 100;
    return ((currentValue - min) / (max - min)) * 100;
  }, [currentValue, props.min, props.max]);

  // 优化的更新值函数 - 同时支持鼠标和触摸事件
  const updateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current || !handleRef.current || !fillRef.current) return;

      // 简单节流，避免过于频繁的更新
      const now = Date.now();
      if (now - lastUpdateTime.current < 16) return; // 约60fps
      lastUpdateTime.current = now;

      const trackRect = trackRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;
      const min = props.min || 0;
      const max = props.max || 100;

      // 计算在轨道上的相对位置（百分比）
      let percent = (clientX - trackRect.left) / trackRect.width;
      // 限制在0-1范围内
      percent = Math.max(0, Math.min(1, percent));

      // 计算对应的值
      const value = min + percent * (max - min);

      // 更新DOM元素位置 - 直接操作DOM而不是依赖React状态更新
      const percentValue = ((value - min) / (max - min)) * 100;
      handleRef.current.style.left = `calc(${percentValue}% - ${handleWidth / 2}px)`;
      fillRef.current.style.width = `${percentValue}%`;

      setCurrentValue(value);

      requestAnimationFrame(() => {
        const event = {
          target: {
            value: value.toString(),
          },
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      });
    },
    [props.min, props.max, props.onChange],
  );

  // 处理鼠标按下事件
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // 防止文本选择
      setIsDragging(true);
      playSeEnter();
      updateValueFromPosition(e.clientX);
    },
    [playSeEnter, updateValueFromPosition],
  );

  // 处理触摸开始事件
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault(); // 防止滚动等默认行为
      setIsDragging(true);
      setIsHovered(true); // 在触摸时显示气泡
      playSeEnter();

      if (e.touches.length > 0) {
        updateValueFromPosition(e.touches[0].clientX);
      }
    },
    [playSeEnter, updateValueFromPosition],
  );

  // 使用useEffect监听全局的鼠标移动和鼠标释放事件
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        updateValueFromPosition(e.clientX);
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault(); // 防止滚动
        requestAnimationFrame(() => {
          updateValueFromPosition(e.touches[0].clientX);
        });
      }
    };

    // 鼠标释放处理
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsHovered(false);
      if (playSeClick) playSeClick();
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setIsHovered(false);
      if (playSeClick) playSeClick();
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // passive: false 允许我们阻止默认行为
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);

    if (handleRef.current) {
      handleRef.current.classList.add('dragging');
    }

    // 清理函数
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);

      if (handleRef.current) {
        handleRef.current.classList.remove('dragging');
      }
    };
  }, [isDragging, updateValueFromPosition, playSeClick]);

  useEffect(() => {
    setCurrentValue(props.initValue);
  }, [props.initValue]);

  useEffect(() => {
    if (isDragging || !handleRef.current || !fillRef.current) return;

    const percentValue = getPercentValue();
    const handleWidth = handleRef.current.offsetWidth;

    handleRef.current.style.left = `calc(${percentValue}% - ${handleWidth / 2}px)`;
    fillRef.current.style.width = `${percentValue}%`;
  }, [currentValue, getPercentValue, isDragging]);

  return (
    <div
      className="Option_WebGAL_slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      <div className="tarck" ref={trackRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
        <div className="tarck-fill" ref={fillRef} style={{ width: `${getPercentValue()}%` }}></div>
        <div
          className="tarck-handle"
          ref={handleRef}
          style={{
            left: `calc(${getPercentValue()}% - 20px)`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <Sort size="24" />
        </div>
        {(isHovered || isDragging) && (
          <div
            className="bubble"
            ref={bubbleRef}
            style={{
              left: `${getPercentValue()}%`,
            }}
          >
            {Number(currentValue.toFixed(1))}
          </div>
        )}
      </div>
    </div>
  );
};
