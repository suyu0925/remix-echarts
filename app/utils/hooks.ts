import { useCallback, useEffect, useRef, useState } from 'react';

export const useHoverObserver = (ele: HTMLDivElement | null) => {
  const [isHover, setIsHover] = useState(false);
  useEffect(() => {
    const setTrue = () => setIsHover(true);
    const setFalse = () => setIsHover(false);
    ele?.addEventListener('mouseenter', setTrue);
    ele?.addEventListener('mouseleave', setFalse);
    return () => {
      ele?.removeEventListener('mouseenter', setTrue);
      ele?.removeEventListener('mouseleave', setFalse);
    };
  }, [ele]);
  return isHover;
};

export const hasResizeObserver =
  typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined';

const makeResizeObserver = (
  node: Element,
  callback: ResizeObserverCallback
) => {
  let observer;
  if (hasResizeObserver) {
    observer = new window.ResizeObserver(callback);
    observer.observe(node);
  }
  return observer;
};

export const useResizeObserver = (
  container: Element | null,
  dimension?: 'width' | 'height'
) => {
  const [size, _setSize] = useState({ width: 0, height: 0 });

  // _currentDimensions and _setSize are used to only store the
  // new state (and trigger a re-render) when the new dimensions actually differ
  const _currentDimensions = useRef(size);
  const setSize = useCallback(
    (dimensions: { width: number; height: number }) => {
      const doesWidthMatter = dimension !== 'height';
      const doesHeightMatter = dimension !== 'width';
      if (
        (doesWidthMatter &&
          _currentDimensions.current.width !== dimensions.width) ||
        (doesHeightMatter &&
          _currentDimensions.current.height !== dimensions.height)
      ) {
        _currentDimensions.current = dimensions;
        _setSize(dimensions);
      }
    },
    [dimension]
  );

  useEffect(() => {
    if (container != null) {
      // ResizeObserver's first call to the observation callback is scheduled in the future
      // so find the container's initial dimensions now
      const boundingRect = container.getBoundingClientRect();
      setSize({
        width: boundingRect.width,
        height: boundingRect.height,
      });

      const observer = makeResizeObserver(container, () => {
        // `entry.contentRect` provides incomplete `height` and `width` data.
        // Use `getBoundingClientRect` to account for padding and border.
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly
        const { height, width } = container.getBoundingClientRect();
        setSize({
          width,
          height,
        });
      });

      return () => observer && observer.disconnect();
    } else {
      setSize({ width: 0, height: 0 });
    }
  }, [container, setSize]);

  return size;
};
