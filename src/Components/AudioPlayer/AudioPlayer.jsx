import { useEffect, useState, useMemo, useContext, useRef } from "react";
import PropTypes from "prop-types";
import { ReactComponent as MutedIcon } from "../../assets/muted.svg";
import { ReactComponent as VolumeIcon } from "../../assets/volume.svg";
import { secondsToMinutes } from "../../Utils/helpers";
import { AudioContext } from "../../Contexts/AudioContext";

function AudioPlayer() {
  const { audioStream } = useContext(AudioContext);
  const audioStreams = audioStream.audioStreams.sort(
    (a, b) => a.bitrate - b.bitrate
  );
  const currentSongRef = useRef(
    new Audio(audioStreams[audioStreams.length - 1].url)
  );
  const currentSong = currentSongRef.current;
  const [currentTime, setCurrentTime] = useState(currentSong.currentTime);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    currentSong.ontimeupdate = () => {
      setCurrentTime(currentSong.currentTime);
    };
  }, [currentSong]);

  function changeVolume(e) {
    setVolume(Number(e.target.value));
    currentSong.volume = e.target.value / 100;
  }

  function pauseAudio() {
    setPlaying(false);
    currentSong.pause();
  }

  function playAudio() {
    setPlaying(true);
    currentSong.play();
  }

  return (
    <div
      id="audioPlayer"
      className="flex flex-col md:flex-row justify-between items-center gap-4  w-full pd-container"
    >
      <p
        className="w-full text-center md:w-1/4 md:text-left"
        title={audioStream.title}
      >
        {audioStream.title.slice(0, 25)}...
      </p>
      <div className="w-full md:w-2/3 flex-grow flex flex-col items-center gap-4">
        <AudioTrack
          currentSong={currentSong}
          currentTime={currentTime}
          totalTime={audioStream.duration}
        />
        <div className="flex gap-4 justify-center">
          <button>Prev</button>
          {playing ? (
            <button onClick={pauseAudio}>Pause</button>
          ) : (
            <button onClick={playAudio}>Play</button>
          )}
          <button>Next</button>
        </div>
      </div>
      <div className="w-full flex justify-center md:w-1/4 md:justify-end">
        <Volume volume={volume} handleVolumeChange={changeVolume} />
      </div>
    </div>
  );
}

function Volume({ volume, handleVolumeChange }) {
  const [visibility, setVisibility] = useState(false);

  function toggleVolumeSlider() {
    setVisibility(!visibility);
  }

  return (
    <div className="group relative flex items-center gap-4">
      <button onClick={toggleVolumeSlider} className="h-7 w-7 md:w-10 md:h-10">
        {volume > 0 ? <VolumeIcon /> : <MutedIcon />}
        <span className="sr-only">{volume}</span>
      </button>

      {visibility && (
        <div className="md:absolute md:-top-4 md:left-1/2 md:-rotate-90 md:origin-left z-5">
          <label htmlFor="changeVolume" className="sr-only">
            Change volume
          </label>
          <input
            onChange={handleVolumeChange}
            id="changeVolume"
            type="range"
            value={volume}
          />
        </div>
      )}
      <p
        aria-hidden="true"
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute top-2 -left-4 -translate-x-1/2"
      >
        {volume}
      </p>
    </div>
  );
}

function AudioTrack({ currentSong, currentTime, totalTime: audioDuration }) {
  const totalDuration = useMemo(
    () => secondsToMinutes(audioDuration),
    [audioDuration]
  );

  const width = (currentTime / audioDuration) * 100;
  const currentTimeDisplay = secondsToMinutes(currentTime);

  function handleTrackClick(event) {
    currentSong.currentTime = event.target.value;
  }

  return (
    <div className="w-full flex flex-row gap-4 md:gap-8">
      <p className="text-sm md:text-base">
        {currentTimeDisplay.minutes}:{currentTimeDisplay.seconds}
      </p>
      <div
        id="audioTrack"
        className="group flex-grow flex flex-col 
      items-center justify-center relative"
      >
        <label htmlFor="trackSeekerInput" className="sr-only">
          Seek the track forward or backwards
        </label>
        <input
          value={0}
          type="range"
          id="trackSeekerInput"
          className="w-full opacity-0 cursor-pointer absolute  z-10"
          max={audioDuration}
          onInput={handleTrackClick}
        />
        <div
          id="trackFull"
          className="w-full bg-gray-400 h-1 rounded-full relative"
        >
          <div
            style={{ width: width + "%" }}
            id="trackRunning"
            className="h-full bg-accent-light absolute rounded-full"
          ></div>
        </div>
      </div>
      <p className="text-sm md:text-base">
        {totalDuration.minutes}:{totalDuration.seconds}
      </p>
    </div>
  );
}

Volume.propTypes = {
  volume: PropTypes.number,
  handleVolumeChange: PropTypes.func,
};

AudioTrack.propTypes = {
  currentSong: PropTypes.object,
  currentTime: PropTypes.number,
  totalTime: PropTypes.number,
};

export default AudioPlayer;
