export interface ICloudinaryImageService {
    /**
     * Uploads a base64/buffer image to Cloudinary.
     * @param source Base64 string or Buffer
     * @param folder Target folder in Cloudinary
     */
    uploadImage(source: string | Buffer, folder: string): Promise<string>;

    /**
     * Deletes an image from Cloudinary using its URL.
     * @param url Public URL of the image
     */
    deleteImage(url: string): Promise<void>;

    /**
     * Processes a list of images (URLs or Base64) to achieve a desired state.
     * Deletes URLs no longer present and uploads new Base64 strings.
     * @param currentUrls Current URLs stored in DB
     * @param desiredState State sent from frontend (mix of URLs and Base64)
     * @param folder Folder for new uploads
     */
    processGalleryUpdate(currentUrls: string[], desiredState: string[], folder: string): Promise<string[]>;
}
