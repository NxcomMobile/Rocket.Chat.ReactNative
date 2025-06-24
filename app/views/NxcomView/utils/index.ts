export function convertHttpToHttps(url: string): string {
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol === "http:") {
            urlObj.protocol = "https:";
        }
        return urlObj.href;
    } catch (error) {
        // Xử lý lỗi (ví dụ: trả về URL gốc hoặc throw custom error)
        return url;
    }
}