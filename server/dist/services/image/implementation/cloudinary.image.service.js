import cloudinary from "../../../config/cloudinary.js";
import { uploadBufferToCloudinary, extractPublicId } from "../../../utils/cloudinaryUpload.js";
import Logger from "../../../utils/logger.js";
export class CloudinaryImageService {
    async uploadImage(source, folder) {
        if (Buffer.isBuffer(source)) {
            return uploadBufferToCloudinary(source, folder);
        }
        try {
            const result = await cloudinary.uploader.upload(source, {
                folder: folder,
            });
            return result.secure_url;
        }
        catch (error) {
            Logger.error(`Cloudinary upload failed for folder ${folder}:`, error);
            throw error;
        }
    }
    async deleteImage(url) {
        const publicId = extractPublicId(url);
        if (!publicId)
            return;
        try {
            await cloudinary.uploader.destroy(publicId);
            Logger.info(`Deleted image with public ID: ${publicId}`);
        }
        catch (error) {
            Logger.error(`Failed to delete image with public ID ${publicId}:`, error);
        }
    }
    async processGalleryUpdate(currentUrls, desiredState, folder) {
        // 1. Identify URLs to delete (in currentUrls but not in desiredState)
        const urlsToDelete = currentUrls.filter(url => !desiredState.includes(url));
        await Promise.all(urlsToDelete.map(url => this.deleteImage(url)));
        // 2. Process desired state items
        const processedUrls = await Promise.all(desiredState.map(async (item) => {
            if (item.startsWith("http")) {
                // It's an existing URL, keep it
                return item;
            }
            else if (item.startsWith("data:image")) {
                // It's a base64 image, upload it
                return this.uploadImage(item, folder);
            }
            return item; // Fallback
        }));
        return processedUrls.filter(url => typeof url === "string" && url.startsWith("http"));
    }
}
