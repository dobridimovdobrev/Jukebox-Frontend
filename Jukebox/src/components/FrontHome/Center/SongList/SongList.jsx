import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { playSong } from "@/redux/playerSlice";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import songService from "@/services/songService";

const cleanTitle = (title) => title.replace(/["()'\/]/g, "").replace(/\s+/g, " ").trim();

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongList = () => {
  const dispatch = useDispatch();
  const songs = useSelector((s) => s.player.songs);
  const currentSong = useSelector((s) => s.player.currentSong);
  const coins = useSelector((s) => s.player.coins);
  const isGenerating = useSelector((s) => s.player.isGenerating);
  const activeArtistId = useSelector((s) => s.player.activeArtistId);
  const activePlaylistId = useSelector((s) => s.player.activePlaylistId);

  // Track which songs have been "revealed" for the enter animation
  const [revealedCount, setRevealedCount] = useState(0);

  // When generating, track newly added songs for animation
  useEffect(() => {
    if (isGenerating) {
      // Songs are being appended — update revealed count with a slight delay for animation
      const timer = setTimeout(() => {
        setRevealedCount(songs.length);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Not generating — all songs are immediately revealed
      setRevealedCount(songs.length);
    }
  }, [songs.length, isGenerating]);

  const { displayCount, loadMoreRef, hasMore } = useInfiniteScroll({
    itemsPerPage: 20,
    totalItems: songs.length,
  });

  const visibleSongs = isGenerating ? songs : songs.slice(0, displayCount);

  const handleSongClick = (song, index) => {
    if (isGenerating) return;
    dispatch(playSong({ song, index }));
    if (coins > 0) {
      songService.incrementPlayCount(song.songId).catch((err) => {
        console.error("Failed to increment play count:", err);
      });
    }
  };

  if (songs.length === 0 && !isGenerating) {
    return (
      <div className="song-list">
        <div className="song-list__empty">
          {activeArtistId || activePlaylistId
            ? "No songs found"
            : "Select an artist to load songs"}
        </div>
      </div>
    );
  }

  return (
    <div className={`song-list${isGenerating ? " song-list--generating" : ""}`}>
      {isGenerating && songs.length === 0 && (
        <div className="song-list__generating-header">
          Generating playlist...
        </div>
      )}
      {visibleSongs.map((song, index) => {
        const isActive = currentSong?.songId === song.songId;
        const isEntering = isGenerating && index >= revealedCount - 3;
        return (
          <div
            key={song.songId || `gen-${index}`}
            className={`song-list__box${isActive ? " song-list__box--active" : ""}${coins <= 0 && !isGenerating ? " song-list__box--disabled" : ""}${isEntering ? " song-list__box--entering" : ""}`}
            onClick={() => handleSongClick(song, index)}
            ref={!isGenerating && index === visibleSongs.length - 1 && hasMore ? loadMoreRef : null}
          >
            <span className="song-list__number">{index + 1}</span>
            <p className="song-list__title">{cleanTitle(song.title)}</p>
            <span className="song-list__duration">
              {formatDuration(song.duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;
