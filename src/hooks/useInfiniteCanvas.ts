import { useState, useRef, RefObject } from 'react';

interface Offset {
  x: number;
  y: number;
}

export const useInfiniteCanvas = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const isDragging = useRef<boolean>(false);
  const lastPosition = useRef<Offset>({ x: 0, y: 0 });

  // Start panning
  const panStart = (x: number, y: number) => {
    isDragging.current = true;
    lastPosition.current = { x, y };
  };

  // Pan while moving
  const panMove = (x: number, y: number) => {
    if (!isDragging.current) return;

    const dx = (x - lastPosition.current.x) / scale;
    const dy = (y - lastPosition.current.y) / scale;

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));

    lastPosition.current = { x, y };
  };

  // End panning
  const panEnd = () => {
    isDragging.current = false;
  };

  // Zoom in/out around a point
  const zoom = (factor: number, centerX: number, centerY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate where the mouse is pointing in world space before zooming
    const worldX = (centerX / scale - offset.x);
    const worldY = (centerY / scale - offset.y);

    // Apply zoom
    const newScale = Math.max(0.1, Math.min(5, scale * factor));
    setScale(newScale);

    // Adjust offset to keep the point under the mouse
    setOffset({
      x: -worldX + centerX / newScale,
      y: -worldY + centerY / newScale
    });
  };

  // Reset view to center
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  return {
    offset,
    scale,
    panStart,
    panMove,
    panEnd,
    zoom,
    resetView
  };
};