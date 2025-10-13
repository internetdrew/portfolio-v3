import { useRef } from "react";
import { Video } from "./Video";
import type Player from "video.js/dist/types/player";

export const VideoPlayerContainer = ({ videoUrl }: { videoUrl: string }) => {
  const playerRef = useRef<Player | null>(null);

  const videoJsOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoUrl,
        type: "video/youtube",
      },
    ],
  };

  const handlePlayerReady = (player: Player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  return <Video options={videoJsOptions} onReady={handlePlayerReady} />;
};
