import { CopyVideoUrl } from "./copy-video-url";
import { VideoEmbedCode } from "./video-embed-code";

interface VideoShareContainerProps {
  videoId: string;
  videoUrl: string;
}

export function VideoShareContainer({
  videoId,
  videoUrl,
}: VideoShareContainerProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Share this video</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <CopyVideoUrl videoUrl={videoUrl} />
        <VideoEmbedCode videoId={videoId} />
      </div>
    </div>
  );
}
