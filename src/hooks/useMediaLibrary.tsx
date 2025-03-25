import { useState, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail: string;
  duration?: number;
}

export const useMediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [audioItems, setAudioItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        // For images, just use the image itself
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        // For videos, generate a thumbnail
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadeddata = () => {
          // Seek to 1 second or middle of video
          video.currentTime = Math.min(1, video.duration / 2);
        };
        video.onloadedmetadata = () => {
          // Create a canvas to draw the thumbnail
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the video frame
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve("");
            return;
          }

          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg"));
          };
        };

        video.onerror = () => {
          resolve("");
        };

        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("audio/")) {
        // For audio, use a default waveform icon
        resolve("/audio-wave.svg");
      } else {
        resolve("");
      }
    });
  };

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
        const media = file.type.startsWith("video/")
          ? document.createElement("video")
          : document.createElement("audio");

        media.preload = "metadata";

        media.onloadedmetadata = () => {
          URL.revokeObjectURL(media.src);
          resolve(media.duration);
        };

        media.onerror = () => {
          resolve(0);
        };

        media.src = URL.createObjectURL(file);
      } else {
        resolve(0);
      }
    });
  };

  const addMedia = useCallback(async (files: File[]) => {
    setIsLoading(true);

    try {
      const newItems: MediaItem[] = [];

      for (const file of files) {
        const id = uuidv4();
        const thumbnail = await generateThumbnail(file);
        const url = URL.createObjectURL(file);

        let duration = 0;
        if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
          duration = await getMediaDuration(file);
        }

        let type: "image" | "video" | "audio";
        if (file.type.startsWith("image/")) {
          type = "image";
        } else if (file.type.startsWith("video/")) {
          type = "video";
        } else if (file.type.startsWith("audio/")) {
          type = "audio";
        } else {
          // Skip unsupported file types
          continue;
        }

        const newItem = {
          id,
          name: file.name,
          type,
          url,
          thumbnail,
          ...(duration > 0 && { duration }),
        };

        newItems.push(newItem);

        // Also add to the appropriate collection
        if (type === "audio") {
          setAudioItems(prev => [...prev, newItem]);
        }
      }

      // Add to main media items (excluding audio)
      const nonAudioItems = newItems.filter(item => item.type !== "audio");
      if (nonAudioItems.length > 0) {
        setMediaItems(prev => [...prev, ...nonAudioItems]);
      }

      return newItems;
    } catch (error) {
      console.error("Error adding media:", error);
      toast.error("Failed to add media");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMedia = useCallback((id: string) => {
    // First check if the item is in use in the timeline
    const isInUse = (items: MediaItem[]) => {
      const item = items.find((item) => item.id === id);
      if (item) {
        // Only revoke URL if it's not being used
        try {
          // Check if the URL is still valid
          const testAudio = new Audio(item.url);
          testAudio.onerror = () => {
            // URL is invalid, safe to revoke
            URL.revokeObjectURL(item.url);
          };
        } catch (e) {
          // If we can't create an audio element, the URL is probably already revoked
          console.log("URL already revoked or invalid");
        }
      }
      return item;
    };

    setMediaItems(prev => {
      const item = isInUse(prev);
      return prev.filter((item) => item.id !== id);
    });

    setAudioItems(prev => {
      const item = isInUse(prev);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  return {
    mediaItems,
    audioItems,
    isLoading,
    addMedia,
    removeMedia,
  };
};

export default useMediaLibrary;
