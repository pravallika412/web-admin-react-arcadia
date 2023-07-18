import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ReactCrop, { centerCrop, Crop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { GENERATE_PRESIGNED_URL } from "../../graphQL/common/queries";
import { useMutation } from "@apollo/client";

interface CropModalProps {
  openCropModal: boolean;
  setCropModal: (open: boolean) => void;
  setCroppedImageUrl: any;
  src: string;
  setLoadingImage: (open: boolean) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const CropModal: React.FC<CropModalProps> = ({ openCropModal, setCropModal, src, setCroppedImageUrl, setLoadingImage }) => {
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(1 / 1);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [generatePresignedUrlAWS, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const wdfs3Url = process.env.WDFS3URL;

  useEffect(() => {
    if (completedCrop && imgRef.current && previewCanvasRef.current) {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      // const croppedImageUrl = canvas.toDataURL("image/jpeg");
      // setCroppedImageUrl(croppedImageUrl);
    }
  }, [completedCrop]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleDone = async () => {
    setCropModal(false);
    setLoadingImage(true);
    const canvas = await previewCanvasRef.current;
    const base64ImageData = canvas.toDataURL("image/jpeg");
    const croppedImageFile = dataURLtoFile(base64ImageData, "cropped_image.jpg");

    const payload = {
      fileName: "cropped_image.jpg",
      fileType: croppedImageFile.type,
      filePath: "sponsor",
    };

    const presignedUrl = await generatePresignedUrlAWS({ variables: { input: payload } });
    await uploadImage(presignedUrl?.data.GeneratePresignedUrl.presignedUrl, croppedImageFile);
    const updatedUrl = presignedUrl?.data.GeneratePresignedUrl.presignedUrl.split("?")[0]
      ? presignedUrl?.data.GeneratePresignedUrl.presignedUrl.split("?")[0].replace("https://wdf-dev.s3.amazonaws.com", wdfs3Url)
      : "";
    setCroppedImageUrl(updatedUrl);
    setLoadingImage(false);
    setCompletedCrop(null);
  };

  const uploadImage = async (url, data) => {
    await fetch(url, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": data.type,
      },
    });
  };

  const dataURLtoFile = (dataURL, fileName) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  return (
    <>
      <Dialog
        open={openCropModal}
        onClose={() => setCropModal(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            width: 500,
            height: 500, // Ensure it does not exceed screen width
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">{"Crop Image"}</DialogTitle>
        <DialogContent>
          {!!src && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(completedCrop) => {
                setCompletedCrop(completedCrop);
              }}
              aspect={1 / 1}
            >
              <img ref={imgRef} alt="Crop me" src={src} onLoad={onImageLoad} />
            </ReactCrop>
          )}
          {!!completedCrop && (
            <>
              <div>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop.width,
                    height: completedCrop.height,
                  }}
                />
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCropModal(false);
              setCompletedCrop(null);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDone} color="primary" autoFocus>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CropModal;
