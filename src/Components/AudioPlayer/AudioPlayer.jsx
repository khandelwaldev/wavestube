import { useEffect, useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { ReactComponent as MutedIcon } from "../../assets/muted.svg";
import { ReactComponent as LowVolumeIcon } from "../../assets/low_volume.svg";
import { ReactComponent as VolumeIcon } from "../../assets/volume.svg";
import { CaretDown, CaretUp, Play, SkipBack, SkipForward, Spinner, X } from "@phosphor-icons/react";
import { secondsToMinutes } from "../../Utils/helpers";
import { AudioContext } from "../../Contexts/AudioContext";
import { Pause } from "@phosphor-icons/react/dist/ssr";


function AudioPlayer() {
  const { audioStream, currentSong, playbackStarted, setPlaybackStarted } =
    useContext(AudioContext);
  const [currentTime, setCurrentTime] = useState(currentSong.currentTime);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(100);


  useEffect(() => {
    currentSong.ontimeupdate = () => setCurrentTime(currentSong.currentTime);

    currentSong.addEventListener(
      "canplaythrough",
      () => {
        console.log(
          "Component <AudioPlayer />: Song should be able to play now."
        );
        setPlaybackStarted(true);
        if (currentSong.paused) playAudio();
      },
      []
    );

    currentSong.onended = () => setPlaying(false);

    currentSong.preload = true;
  }, []);

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

  // navigators 

  navigator.mediaSession.metadata = new MediaMetadata({
    title: audioStream.title,
    artist: audioStream.uploader,
    // album: 'unknown',
    artwork: [
      {
        src: audioStream.thumbnailUrl,
        sizes: "128x128 256x256",
        type: "image/x-icon",
      },
    ],
  });

  navigator.mediaSession.setActionHandler("previoustrack", function () {
    // handlePrevSong();
  });

  navigator.mediaSession.setActionHandler("nexttrack", function () {
    // handleNextSong();
  });

  return (
    <div
      id="audioPlayer"
      className="fixed bottom-0 w-full h-[75px] bg-black border-t border-gray-600 flex items-center justify-between px-5"
    >
      {/** Song Info */}
      <div className="flex items-center gap-3 max-w-[395px] w-full">
          <div className="max-w-[80px] max-h-[50px] w-full h-full">
              <img
                src={audioStream.thumbnailUrl}
                alt="Song Cover"
                className="rounded-lg w-full h-full"
              />
          </div>
          <div>
                <h1 className="text-[14px] font-medium line-clamp-1">{audioStream.title}</h1>
                <p className="text-[13px] text-secondaryText">
                  {audioStream.uploader}
                </p>
          </div>
        </div>

      <div className="flex flex-col gap-3 items-center justify-center">
        <div className="flex gap-4 w-full justify-between items-center ">
          <div className="flex flex-grow justify-center gap-4 ml-6 md:ml-0">
            <button
              disabled
              className="w-[32px] h-[32px] flex items-center justify-center hover:bg-gray-700 cursor-pointer rounded-full"
              title="Not available yet."
            >
              <SkipBack size={22} />
            </button>
            {!playbackStarted && (
              <button className="w-[32px] h-[32px] animate-spin flex items-center justify-center bg-white rounded-full text-black">
                <Spinner size={22} />
              </button>
            )}
            {playbackStarted && playing && (
              <button
                className="w-[32px] h-[32px] flex items-center justify-center bg-white rounded-full text-black"
                onClick={pauseAudio}
              >
                <Pause size={22} />
              </button>
            )}
            {playbackStarted && !playing && (
              <button
                className="group w-12 h-12 bg-bg-light rounded-full p-3"
                onClick={playAudio}
              >
                <Play size={22} />
              </button>
            )}{" "}
            <button
              disabled
              className="w-[32px] h-[32px] flex items-center justify-center hover:bg-gray-500 cursor-pointer rounded-full"
              title="Not available yet."
            >
              <SkipForward size={22} />
            </button>
          </div>
          {
            // Volume changer for mobile
          }
          <div className="md:hidden">
            <Volume volume={volume} handleVolumeChange={changeVolume} />
          </div>
        </div>
        <AudioTrack
          currentSong={currentSong}
          currentTime={currentTime}
          totalTime={audioStream.duration}
        />
      </div>
      <div className="w-full flex justify-center md:w-1/4 md:justify-end">
        {
          // Volume changer for desktops
        }
        <div className="hidden md:block">
          <Volume volume={volume} handleVolumeChange={changeVolume} />
        </div>
      </div>
    </div>
  );
}

function Volume({ volume, handleVolumeChange }) {
  const [visibility, setVisibility] = useState(false);

  function toggleVolumeSlider() {
    setVisibility(!visibility);
  }

  let volumeIcon;

  if (volume == 0) {
    volumeIcon = <MutedIcon />;
  } else if (volume <= 50) {
    volumeIcon = <LowVolumeIcon />;
  } else {
    volumeIcon = <VolumeIcon />;
  }

  return (
    <div className="group relative flex items-center gap-4">
      <button onClick={toggleVolumeSlider} className="h-6 w-6 md:w-8 md:h-8">
        {volumeIcon}
        <span className="sr-only">{volume}</span>
      </button>

      {visibility && (
        <div className="group-focus-within:visible invisible absolute -top-4 left-1/2 -rotate-90 origin-left z-5 p-4 pb-0 backdrop-blur-sm rounded-full">
          <label htmlFor="changeVolume" className="sr-only">
            Change volume
          </label>
          <input
            className="w-[100px]"
            onChange={handleVolumeChange}
            id="changeVolume"
            type="range"
            value={volume}
          />
        </div>
      )}
      <p
        aria-hidden="true"
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute -left-4 -translate-x-1/2"
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
    <div className="w-[441px] flex flex-row gap-4 md:gap-8">
      <p className="text-[12px] text-secondaryText">
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
          type="range"
          id="trackSeekerInput"
          className="w-full opacity-0 cursor-pointer absolute z-10 "
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
      <p className="text-[12px] text-secondaryText">
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
