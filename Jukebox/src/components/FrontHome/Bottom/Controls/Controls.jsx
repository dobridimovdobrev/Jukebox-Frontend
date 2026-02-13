import { IoVideocamSharp } from "react-icons/io5";
import { IoMusicalNotes } from "react-icons/io5";
import { IoPlaySkipBack } from "react-icons/io5";
import { IoPlay } from "react-icons/io5";
import { IoPlayForward } from "react-icons/io5";
import { IoPlayBack } from "react-icons/io5";
import { IoPause } from "react-icons/io5";
import { IoPlaySkipForward } from "react-icons/io5";
import { IoList } from "react-icons/io5";
import { IoVolumeHigh } from "react-icons/io5";
import { IoVolumeMute } from "react-icons/io5";

const Controls = ({
  isPlaying,
  onPlayPause,
  showVideo,
  onToggleView,
  onSkipBack,
  onSkipForward,
  onSeekBack,
  onSeekForward,
  onPlaylistClick,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="controls">
      {/* toggle Disc/Video view - single rotating icon */}
      <div
        className={`controls__toggle ${showVideo ? '' : 'controls__toggle--flipped'}`}
        onClick={() => onToggleView(!showVideo)}
        title={showVideo ? "Mostra disco" : "Mostra video"}
      >
        <IoMusicalNotes className="controls__toggle-front" />
        <IoVideocamSharp className="controls__toggle-back" />
      </div>

      {/* playback controls */}
      <IoPlayBack
        className="controls__icon"
        onClick={onSeekBack}
        title="Indietro 10s"
      />
      <IoPlaySkipBack
        className="controls__icon"
        onClick={onSkipBack}
        title="Traccia precedente"
      />

      {/* Play/Pause toggle */}
      {isPlaying ? (
        <IoPause
          className="controls__icon controls__icon--play"
          onClick={onPlayPause}
          title="Pausa"
        />
      ) : (
        <IoPlay
          className="controls__icon controls__icon--play"
          onClick={onPlayPause}
          title="Play"
        />
      )}

      <IoPlaySkipForward
        className="controls__icon"
        onClick={onSkipForward}
        title="Traccia successiva"
      />
      <IoPlayForward
        className="controls__icon"
        onClick={onSeekForward}
        title="Avanti 10s"
      />
      <IoList
        className="controls__icon"
        onClick={onPlaylistClick}
        title="Playlist"
      />
      {isMuted ? (
        <IoVolumeMute
          className="controls__icon"
          onClick={onToggleMute}
          title="Attiva audio"
        />
      ) : (
        <IoVolumeHigh
          className="controls__icon"
          onClick={onToggleMute}
          title="Muta audio"
        />
      )}
    </div>
  );
};

export default Controls;
