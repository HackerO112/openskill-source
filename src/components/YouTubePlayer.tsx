import { useEffect, useRef } from 'react';

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<any> | null = null;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(s);
    });
  }
  return apiPromise;
}

export default function YouTubePlayer({ videoId, onEnded }: { videoId: string; onEnded: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const endRef = useRef(onEnded);
  endRef.current = onEnded;

  useEffect(() => {
    let player: any;
    let cancelled = false;
    loadApi().then((YT) => {
      if (cancelled || !ref.current) return;
      const el = document.createElement('div');
      ref.current.innerHTML = '';
      ref.current.appendChild(el);
      player = new YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
        events: { onStateChange: (e: any) => { if (e.data === 0) endRef.current(); } },
      });
    });
    return () => { cancelled = true; player?.destroy?.(); };
  }, [videoId]);

  return <div ref={ref} className="w-full aspect-video rounded-xl overflow-hidden bg-foreground [&_iframe]:w-full [&_iframe]:h-full" />;
}
