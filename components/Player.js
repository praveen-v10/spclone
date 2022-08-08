
import { FastForwardIcon, PauseIcon, PlayIcon, ReplyIcon, RewindIcon, SwitchHorizontalIcon, VolumeUpIcon } from "@heroicons/react/solid";
import { HeartIcon, VolumeUpIcon as VolumeDownIcon , } from "@heroicons/react/outline";
import {useSession} from "next-auth/react";
import {useCallback, useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSonginfo";
import useSpotify from "../hooks/useSpotify";
import { debounce } from "lodash";

function Player() {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentIdTrack] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const[volume, setVolume] = useState(50);

    const songInfo = useSongInfo();

    const fetchCurrentSong = () => {
      if (!songInfo) {
        spotifyApi.getMyCurrentPlayingTrack().then((data) => {
          console.log("now playing :", data.body?.item);
          setCurrentIdTrack(data.body?.item?.id);
          
          spotifyApi.getMyCurrentPlaybackState().then((data) => {
            setIsPlaying(data.body?.is_playing);
          });

        });
      }
    };
  
    const handlePlayPause = () => {
      spotifyApi.getMyCurrentPlaybackState().then((data) => {
        if (data.body.is_playing) {
          spotifyApi.pause();
          setIsPlaying(false);
        } else {
          spotifyApi.play();
          setIsPlaying(true);
        }
      });
    };


    useEffect(() => {
      if(spotifyApi.getAccessToken() && !currentTrackId) {
        fetchCurrentSong();
        setVolume(50);
      }
    }, [currentTrackIdState, spotifyApi, session]);
    
    useEffect(() => {
      if(volume > 0 && volume < 100) {
        debouncedAdjustVolume(volume);
      }
    }, [volume]);
    
    const debouncedAdjustVolume = useCallback(
      debounce((volume) => {
        spotifyApi.setVolume(volume).catch((err) => {});
      }, 500),
      []
    );


    return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
      {/* left */}
      <div>
      <img className="hidden md:inline h-10 w-10"
        src={songInfo?.album.images?.[0]?.url} />
      <div>
        <h3>{songInfo?.name}</h3>
        <p>{songInfo?.artists?.[0]?.name}</p>
      </div> 
      </div>
      {/* center */}

      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon className="button" />

        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
        ) : (
          <PlayIcon onClick={handlePlayPause}  className="button w-10 h-10" />
        )}

        <FastForwardIcon className="button" />
        <ReplyIcon className="button" />
       </div>
       {/* right */}
          <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
            <VolumeDownIcon onClick={() => volume > 0 && setVolume(volume - 10)} className="button" />
            <input className="w-14 md:w-28" type="range" value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))} min={0} max={100} />
            <VolumeUpIcon onClick={() => volume < 100 && setVolume(volume - 100)} className="button" />

          </div>
    </div>
      
  );
}

export default Player;