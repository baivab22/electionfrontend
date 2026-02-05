import React, { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setStreaming(true);
        setIsLoading(false);
      };
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Cannot access camera. Please check permissions.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);

    // Convert to blob and send to parent component
    canvas.toBlob((blob) => {
      if (onCapture) {
        onCapture({
          blob,
          dataUrl,
          filename: `photo_${new Date().getTime()}.png`
        });
      }
    }, "image/png");
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Camera</h2>
      
      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={startCamera} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}
      
      <div style={styles.cameraContainer}>
        {!streaming && !photo && (
          <div style={styles.placeholder}>
            {isLoading ? (
              <p>Loading camera...</p>
            ) : (
              <button 
                onClick={startCamera} 
                style={styles.button}
                disabled={isLoading}
              >
                Open Camera
              </button>
            )}
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{
            ...styles.video,
            display: streaming && !photo ? 'block' : 'none'
          }} 
        />
        
        {photo && (
          <img 
            src={photo} 
            alt="Captured" 
            style={styles.preview} 
          />
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: "none" }} />
      
      <div style={styles.controls}>
        {streaming && !photo && (
          <>
            <button onClick={capturePhoto} style={styles.captureButton}>
              Take Photo
            </button>
            <button onClick={stopCamera} style={styles.secondaryButton}>
              Close Camera
            </button>
          </>
        )}
        
        {photo && (
          <>
            <button onClick={retakePhoto} style={styles.button}>
              Retake Photo
            </button>
            <button onClick={stopCamera} style={styles.secondaryButton}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Styles for the component
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#333'
  },
  cameraContainer: {
    width: '100%',
    height: '300px',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholder: {
    color: '#fff',
    textAlign: 'center'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  preview: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  captureButton: {
    padding: '15px 25px',
    backgroundColor: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    height: '60px',
    width: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f1f1',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
    width: '100%'
  },
  retryButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};