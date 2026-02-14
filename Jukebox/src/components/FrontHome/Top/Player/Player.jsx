import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { nextSong, pause } from "@/redux/playerSlice";
import songService from "@/services/songService";
import VinylDisc from "@/assets/retro-vinyl-disc.webp";
import VinylBackground from "@/assets/new-vinyl-background.webp";
import Braccio from "@/assets/braccio.webp";

// Singleton: load YouTube IFrame API script once
let ytApiPromise = null;
const loadYTApi = () => {
  if (ytApiPromise) return ytApiPromise;
  if (window.YT?.Player) return Promise.resolve();

  ytApiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = resolve;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return ytApiPromise;
};

const Player = forwardRef(({ isPlaying, showVideo }, ref) => {
  const ytPlayer = useRef(null);
  const playerContainerRef = useRef(null);
  const stateRef = useRef({});
  const isPlayingRef = useRef(isPlaying);
  const dispatch = useDispatch();

  // Keep isPlayingRef current so the YT useEffect can read it without re-triggering
  isPlayingRef.current = isPlaying;
  const [ytReady, setYtReady] = useState(!!window.YT?.Player);

  const currentSong = useSelector((s) => s.player.currentSong);
  const currentIndex = useSelector((s) => s.player.currentIndex);
  const songs = useSelector((s) => s.player.songs);
  const coins = useSelector((s) => s.player.coins);

  // Keep stateRef current for closure in YT event handler
  stateRef.current = { currentIndex, songs, coins };

  // Load YouTube API on mount
  useEffect(() => {
    loadYTApi().then(() => setYtReady(true));
  }, []);

  // Handle video state change (auto-next / stop at end of playlist)
  const handleStateChange = useCallback(
    (event) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        const { currentIndex, songs, coins } = stateRef.current;
        if (currentIndex < songs.length - 1 && coins > 0) {
          const nextSongObj = songs[currentIndex + 1];
          dispatch(nextSong());
          songService.incrementPlayCount(nextSongObj.songId).catch((err) => {
            console.error("Failed to increment play count:", err);
          });
        } else {
          dispatch(pause());
        }
      }
    },
    [dispatch]
  );

  // Create or update YouTube player when song changes
  useEffect(() => {
    if (!ytReady || !currentSong?.youtubeId) return;

    if (ytPlayer.current) {
      // Player already exists → load or cue based on play state
      if (isPlayingRef.current) {
        ytPlayer.current.loadVideoById(currentSong.youtubeId);
      } else {
        ytPlayer.current.cueVideoById(currentSong.youtubeId);
      }
      return;
    }

    // First time → create player inside container
    if (!playerContainerRef.current) return;
    const div = document.createElement("div");
    playerContainerRef.current.innerHTML = "";
    playerContainerRef.current.appendChild(div);

    ytPlayer.current = new window.YT.Player(div, {
      videoId: currentSong.youtubeId,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: isPlayingRef.current ? 1 : 0,
        controls: 1,
      },
      events: {
        onStateChange: handleStateChange,
      },
    });
  }, [ytReady, currentSong?.youtubeId, handleStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ytPlayer.current?.destroy) {
        ytPlayer.current.destroy();
        ytPlayer.current = null;
      }
    };
  }, []);

  // Expose play/pause/seek/mute to parent via ref
  useImperativeHandle(ref, () => ({
    controlYouTube: (action) => {
      if (!ytPlayer.current?.playVideo) return;
      if (action === "play") ytPlayer.current.playVideo();
      else ytPlayer.current.pauseVideo();
    },
    seekYouTube: (offset) => {
      if (!ytPlayer.current?.getCurrentTime) return;
      const current = ytPlayer.current.getCurrentTime() || 0;
      ytPlayer.current.seekTo(Math.max(0, current + offset), true);
    },
    muteYouTube: () => {
      if (!ytPlayer.current?.mute) return;
      ytPlayer.current.mute();
    },
    unmuteYouTube: () => {
      if (!ytPlayer.current?.unMute) return;
      ytPlayer.current.unMute();
    },
  }));

  const hasVideo = !!currentSong?.youtubeId;

  return (
    <div className={`player-flip ${showVideo ? "" : "player-flip--flipped"}`}>
      <div className="player-flip__front">
        {/* YouTube player container - always in DOM, hidden when no video */}
        <div
          ref={playerContainerRef}
          className="w-100 h-100 overflow-hidden"
          style={{ display: hasVideo ? "block" : "none" }}
        />
        {/* Placeholder when no song selected */}
        {!hasVideo &&
          (coins <= 0 ? (
            <div className="player-flip__placeholder player-flip__placeholder--no-coins">
              <span>No coins!</span>
              <span>Play the Quiz Jukebox to earn more</span>
            </div>
          ) : (
            <div className="player-flip__placeholder">
              Select a song to play
            </div>
          ))}
      </div>
      <div className="player-flip__back">
        <img
          src={VinylBackground}
          alt="Vinyl player background"
          className="vinyl-background"
        />
        <div className="vinyl-container">
          <img
            src={VinylDisc}
            alt="Vinyl disc"
            className={`disc ${isPlaying ? "disc--spinning" : ""}`}
          />
        </div>
        <img
          src={Braccio}
          alt="Tonearm"
          className={`tonearm ${isPlaying ? "tonearm--playing" : ""}`}
        />
      </div>
    </div>
  );
});

export default Player;
