import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use top: 0, left: 0 with behavior: "instant" 
    // to ensure the user starts at the top of the new page immediately.
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // "instant" prevents the slow-scroll animation during route changes
      });
    } catch (error) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;