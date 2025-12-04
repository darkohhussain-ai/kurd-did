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
      // Check if HLS is supported and if the URL looks like an HLS stream (includes .m3u8 or .m3u)
      if (window.Hls && window.Hls.isSupported() && (url.includes('.m3u8') || url.includes('.m3u'))) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.log("Autoplay prevented:", error);
                      // If autoplay fails (often due to unmuted), we ensure muted is set and try again if needed
                      if (!video.muted && muted) {
                          video.muted = true;
                          video.play();
                      }
                  });
              }
          }
        });

        // Error handling for stream recovery
        hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
                switch (data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                    console.log("fatal network error encountered, trying to recover");
                    hls.startLoad();
                    break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                    console.log("fatal media error encountered, trying to recover");
                    hls.recoverMediaError();
                    break;
                default:
                    console.log("fatal error, cannot recover");
                    hls.destroy();
                    break;
                }
            }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        if (autoPlay) {
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.log("Native Autoplay blocked", e));
            });
        }
      } else {
        // Standard MP4/WebM
        video.src = url;
        if (autoPlay) video.play().catch(e => console.log("Standard Autoplay blocked", e));
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
        playsInline // Critical for mobile/iOS autoplay
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        style={{ objectFit: muted ? 'cover' : 'contain' }} // Cover for background, contain for viewing
      />
    </div>
  );
};

export default VideoPlayer;