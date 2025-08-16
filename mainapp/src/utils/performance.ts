// Performance optimization utilities

// Lazy load heavy components
export const lazyWithPreload = (
  factory: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const Component = React.lazy(factory);
  (Component as any).preload = factory;
  return Component;
};

// Defer non-critical scripts
export const deferScript = (src: string) => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
};

// Optimize images with lazy loading
export const optimizeImages = () => {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img: any) => {
      img.src = img.dataset.src;
      img.loading = 'lazy';
    });
  }
};

// Report Web Vitals
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Prefetch critical routes
export const prefetchRoutes = () => {
  const criticalRoutes = [
    '/calculate-mortgage',
    '/calculate-credit',
    '/refinance-mortgage',
    '/refinance-credit'
  ];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  }
};