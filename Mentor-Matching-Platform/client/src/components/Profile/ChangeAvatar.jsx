import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import { useUser } from "../context/UserContext"; // ✅ Import user context

export default function AvatarUpdatePage() {
  const navigate = useNavigate();
  const { setUser } = useUser(); // ✅ Access context to update avatar URL

  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const generateCropped = useCallback(async () => {
    try {
      const { blob, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setAvatarBlob(blob);
      setPreviewUrl(url);
      URL.revokeObjectURL(imageSrc);
      setImageSrc("");
    } catch (err) {
      console.error("Crop generation error:", err);
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatarBlob) {
      alert("Please select and crop an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatarBlob);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Avatar updated successfully.");

        
        if (data.success && data.url) {
            setUser(prev => ({
              ...prev,
              avatar_url: data.url, 
            }));
          }

        navigate("/profile");
      } else {
        alert("Failed to update avatar: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading avatar.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Update Avatar</h2>

      {/* Step 1: Choose file */}
      {!imageSrc && !previewUrl && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="form-btn"
            onClick={() => fileInputRef.current.click()}
          >
            Choose Image
          </button>
        </>
      )}

      {/* Step 2: Crop */}
      {imageSrc && (
        <div>
          <div style={{ position: "relative", width: 300, height: 300 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button
            type="button"
            className="form-btn mt-2"
            onClick={generateCropped}
          >
            Finish Crop
          </button>
        </div>
      )}

      {/* Step 3: Preview and Upload */}
      {previewUrl && (
        <form onSubmit={handleSubmit} className="form-box">
          <img
            src={previewUrl}
            alt="Avatar Preview"
            className="avatar-preview"
          />
          <button type="submit" className="form-btn mt-4">
            Upload
          </button>
          <button
            type="button"
            className="form-btn secondary-btn mt-2"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
