import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import getCroppedImg from './cropUtils';

export default function AvatarCropper({ onResult }) {
    const inputRef = useRef();
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onFileChange = async e => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setImageSrc(url);
        }
    };

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const { blob, fileUrl } = await getCroppedImg(imageSrc, croppedAreaPixels);
            onResult(blob, fileUrl);
            URL.revokeObjectURL(imageSrc);
            setImageSrc(null);
        } catch (err) {
            console.error(err);
        }
    }, [imageSrc, croppedAreaPixels, onResult]);

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
            <button type="button" onClick={() => inputRef.current.click()}>
                Select Image
            </button>

            {imageSrc && (
                <div style={{ position: 'relative', width: 300, height: 300, marginTop: 20 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                    <div style={{ marginTop: 10 }}>
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(_, v) => setZoom(v)}
                        />
                    </div>
                    <button type="button" onClick={showCroppedImage} style={{ marginTop: 10 }}>
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}
