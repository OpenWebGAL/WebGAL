import { CSSProperties, ReactNode, useEffect, useRef } from "react";

export function HorizontalScroll(props: {children: ReactNode, className?: string, style?: CSSProperties}){
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault(); // 阻止默认垂直滚动
      scrollContainer.scrollLeft += event.deltaY; // 将滚轮上下滑动转换为横向滚动
      event.stopPropagation() // 阻止事件往下传递
    };

    scrollContainer.addEventListener("wheel", handleWheel);
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div ref={scrollRef} className={props.className} style={props.style}>{props.children}</div>
  );
};

export default HorizontalScroll;