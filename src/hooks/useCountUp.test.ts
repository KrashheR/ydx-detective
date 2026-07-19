import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  let now = 0;

  beforeEach(() => {
    now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal(
      'requestAnimationFrame',
      (cb: FrameRequestCallback) => window.setTimeout(() => cb(now), 16) as unknown as number,
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const advance = (ms: number) => {
    now += ms;
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  it('starts at the initial value without animating', () => {
    const { result } = renderHook(() => useCountUp(100, 500));
    expect(result.current).toBe(100);
  });

  it('animates from the previous value up to the new value and settles there', () => {
    const { result, rerender } = renderHook(({ value }) => useCountUp(value, 500), {
      initialProps: { value: 100 },
    });

    act(() => {
      rerender({ value: 600 });
    });

    advance(250);
    expect(result.current).toBeGreaterThan(100);
    expect(result.current).toBeLessThan(600);

    advance(300);
    expect(result.current).toBe(600);
  });

  it('animates in from the given start value on mount when `from` is passed', () => {
    const { result } = renderHook(() => useCountUp(600, 500, 0));
    expect(result.current).toBe(0);

    advance(500);
    expect(result.current).toBe(600);
  });

  it('respects prefers-reduced-motion by jumping straight to the target', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);

    const { result, rerender } = renderHook(({ value }) => useCountUp(value, 500), {
      initialProps: { value: 100 },
    });

    act(() => {
      rerender({ value: 600 });
    });
    advance(16);
    expect(result.current).toBe(600);
  });
});
