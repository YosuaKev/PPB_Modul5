import { useEffect, useRef, useState } from 'react';

// Simple global sequential loader queue so images fetch one-at-a-time
const loaderQueue = {
  queue: [],
  running: false,
  enqueue(task) {
    this.queue.push(task);
    this.runNext();
  },
  async runNext() {
    if (this.running) return;
    const next = this.queue.shift();
    if (!next) return;
    this.running = true;
    try {
      await next();
    } finally {
      this.running = false;
      // schedule next microtask to avoid deep sync
      setTimeout(() => this.runNext(), 0);
    }
  },
};

export default function LazyImage({ src, alt = '', className = '', style = {}, placeholder, onLoad, ...rest }) {
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => {
    if (!imgRef.current) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      io.observe(imgRef.current);
      return () => io.disconnect();
    }
    // fallback: mark visible immediately
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || !src) return;
    let cancelled = false;
    // Enqueue a loader that fetches the image sequentially via fetch to ensure one-at-a-time
    loaderQueue.enqueue(async () => {
      if (cancelled) return;
      try {
        // Use fetch to warm the browser cache and control the load
        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error('Image fetch failed');
        const blob = await response.blob();
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        setLoadedSrc(objectUrl);
        onLoad?.();
      } catch (err) {
        // fallback: set src directly so browser can try
        if (!cancelled) setLoadedSrc(src);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [visible, src]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      if (loadedSrc && loadedSrc.startsWith('blob:')) {
        try { URL.revokeObjectURL(loadedSrc); } catch (e) {}
      }
    };
  }, [loadedSrc]);

  return (
    <div ref={imgRef} className={`relative ${className}`} style={style}>
      {loadedSrc ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={loadedSrc} alt={alt} {...rest} className="w-full h-full object-cover" />
      ) : (
        placeholder || (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
            Loading image...
          </div>
        )
      )}
    </div>
  );
}
