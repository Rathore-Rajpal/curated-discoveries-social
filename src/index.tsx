// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      // Check for updates every hour
      setInterval(async () => {
        try {
          await registration.update();
        } catch (error) {
          console.error('Service worker update failed:', error);
        }
      }, 60 * 60 * 1000);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      console.log('ServiceWorker registration successful');
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  });
} 