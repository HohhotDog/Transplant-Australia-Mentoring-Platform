import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import { useUser } from "../context/UserContext";

export default function AvatarUpdatePage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [imageSrc, setImageSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [avatarBlob, setAvatarBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  // 1️⃣ Select file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageSrc(URL.createObjectURL(file));
  };

  // 2️⃣ On crop finish
  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // 3️⃣ Generate preview + blob
  const generateCropped = useCallback(async () => {
    try {
      const { blob, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setAvatarBlob(blob);
      setPreviewUrl(url);
      URL.revokeObjectURL(imageSrc);
      setImageSrc("");
    } catch (err) {
      console.error("Crop error:", err);
    }
  }, [imageSrc, croppedAreaPixels]);

  // 4️⃣ Submit upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!avatarBlob) {
      return alert("Please select and crop an image first.");
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
      console.log("Upload response:", data);

      if (data.success && data.url) {
        setUser((prev) => ({
          ...prev,
          avatar_url: data.url + "?t=" + Date.now(),
        }));
        alert("Avatar updated successfully.");
        return navigate("/profile");
      } else {
        return alert("Failed to update avatar: " + (data.message || "Unknown"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading avatar.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Update Avatar</h2>

      {/* Step 1: Choose Image */}
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

      {/* Step 3: Preview & Upload */}
      {previewUrl && (
        <form onSubmit={handleUpload} className="form-box">
          <img
            src={previewUrl}
            alt="Avatar Preview"
            className="avatar-preview"
          />
          <button type="submit" className="form-btn mt-4">
            Upload
          </button>
          {/* CANCEL is a simple navigate, NOT a form submit */}
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
