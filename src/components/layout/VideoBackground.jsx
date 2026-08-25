import { useEffect, useRef } from "react";

// Decorative full-page background video — muted, looping, no informational
// content, so it's hidden from assistive tech via aria-hidden.
// Respects prefers-reduced-motion: users who've set that OS/browser
// preference get a paused frame instead of constant motion, per WCAG 2.2.2
// (Pause, Stop, Hide).
const VideoBackground = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="video-background"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
    >
      <source src="/videos/boyz8.mp4" type="video/mp4" />
      Your browser does not support background video.
    </video>
  );
};

export default VideoBackground;
