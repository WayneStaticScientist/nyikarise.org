"use client"
import { AssetDecoder } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export const FeedImage = ({ img, className }: { img: any, className?: string }) => {
    const [error, setError] = useState(false);
    const src = AssetDecoder.decoder(img);

    return (
        <Image
            alt="feed image"
            width={200} // Set a reasonable width for optimization
            height={200}
            // If error is true, load local placeholder. 
            // This stops the server from requesting the bad URL again.
            src={error ? "/placeholder.png" : src}
            onError={() => setError(true)}
            className={className || "w-full h-24 object-cover rounded-xl border border-divider"}
        // If your images are highly volatile/often missing, add:
        // unoptimized={true} 
        />
    );
};