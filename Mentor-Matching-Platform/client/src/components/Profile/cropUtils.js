// src/components/Profile/cropUtils.js
export default function getCroppedImg(imageSrc, pixelCrop) {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imageSrc;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const scaleX = img.naturalWidth / img.width;
            const scaleY = img.naturalHeight / img.height;
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(
                img,
                pixelCrop.x * scaleX,
                pixelCrop.y * scaleY,
                pixelCrop.width * scaleX,
                pixelCrop.height * scaleY,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                resolve({ blob, url });
            }, "image/jpeg");
        };
        img.onerror = (err) => reject(err);
    });
}
