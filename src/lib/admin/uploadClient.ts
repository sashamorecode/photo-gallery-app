type UploadResponse = {
    success: boolean;
    path?: string;
    error?: string;
};

export async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/Admin/upload", {
        method: "POST",
        body: formData,
    });

    const result = (await response.json()) as UploadResponse;

    if (!response.ok || !result.success || !result.path) {
        throw new Error(result.error ?? "Upload failed");
    }

    return result.path;
}
