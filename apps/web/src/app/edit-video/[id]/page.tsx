import { EditVideoForm } from "@/components/edit-video-form";
import { baseApi } from "@/configs/axios";
import { notFound } from "next/navigation";

async function getVideoData(id: string) {
  try {
    const response = await baseApi.get(`/videos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const videoData = await getVideoData(params.id);
  
  if (!videoData) {
    notFound();
  }

  // Prepare the data for the form
  const formData = {
    title: videoData.title,
    description: videoData.description,
    displayOrder: videoData.displayOrder
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Video</h1>
      <EditVideoForm videoId={params.id} initialData={formData} />
    </div>
  );
}
