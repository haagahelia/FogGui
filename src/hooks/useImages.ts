"use client";

import { useEffect, useState } from "react";
import { Image } from "@/types/image";
import { getImages } from "@/services/imageServices";

export function useImages() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getImages()
      .then(setImages)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { images, loading, error };
}
