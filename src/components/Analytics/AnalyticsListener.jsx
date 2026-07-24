import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView, trackClick } from '../../lib/analytics';

// Renders nothing - starts the batched flush loop once, then tracks a
// pageview on every route change. Mounted once at the App root, same
// pattern as the other always-mounted overlay components.
const AnalyticsListener = () => {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();

    // Opt-in click tracking: only elements explicitly tagged data-track,
    // not every click on the page - avoids noise and matches how this
    // codebase already opts into things deliberately.
    const handleClick = (e) => {
      const target = e.target.closest('[data-track]');
      if (!target) return;
      trackClick(window.location.pathname, {
        label: target.getAttribute('data-track'),
      });
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
};

export default AnalyticsListener;
