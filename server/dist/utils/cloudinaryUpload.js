import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
export const uploadBufferToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Upload failed"));
            resolve(result.secure_url);
        });
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
};
export const extractPublicId = (url) => {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1)
            return '';
        const pathParts = parts.slice(uploadIndex + 2);
        const fullPath = pathParts.join('/');
        return fullPath.split('.')[0];
    }
    catch (error) {
        console.error("Error extracting public ID:", error);
        return '';
    }
};
export const deleteFromCloudinary = async (url) => {
    const publicId = extractPublicId(url);
    if (!publicId)
        return;
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error(`Failed to delete image with public ID ${publicId}:`, error);
    }
};
