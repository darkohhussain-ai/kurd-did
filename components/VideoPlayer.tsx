import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, poster, autoPlay = false, muted = false, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Apply muted state immediately to allow autoplay policies to work
    video.muted = muted;

    const initPlayer = () => {
      if (window.Hls && window.Hls.isSupported() && url.endsWith('.m3u8')) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        if (autoPlay) {
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.log("Autoplay blocked", e));
            });
        }
      } else {
        // Standard MP4/WebM
        video.src = url;
        if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url, autoPlay, muted]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${className || ''}`}>
      <video
        ref={videoRef}
        controls={!muted} // Hide native controls if it's a background video
        poster={poster}
        muted={muted}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        style={{ objectFit: muted ? 'cover' : 'contain' }} // Cover for background, contain for viewing
      />
    </div>
  );
};

export default VideoPlayer;