import { TAvatar } from "@/types/avatar";

export const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export class AssetDecoder {
  static decoder(img?: TAvatar | null): string {
    if (!img || !img.media) return "/placeholder.png";

    if (img.media.startsWith("http")) {
      return img.media;
    }

    if (!img.cloud || img.cloud === "r2") {
      return `https://images.comradeconnect.co.zw/${img.media.startsWith('/') ? img.media.slice(1) : img.media}`;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.nyikarise.co.zw/v1";
    const baseUrl = API_BASE_URL.endsWith('/v1') ? API_BASE_URL.slice(0, -3) : API_BASE_URL;

    return `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}${img.media.startsWith('/') ? img.media.slice(1) : img.media}`;
  }
}

