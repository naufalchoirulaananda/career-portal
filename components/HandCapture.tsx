"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Webcam from "react-webcam";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HandCapture({
  onClose,
  onCapture,
}: {
  onClose: () => void;
  onCapture: (image: string) => void;
}) {
  const webcamRef = React.useRef<any>(null);
  const [model, setModel] = React.useState<any>(null);
  const [fingers, setFingers] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [poseStep, setPoseStep] = React.useState(1);
  const [poseStatus, setPoseStatus] = React.useState([false, false, false]);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadModel = async () => {
      const m = await handpose.load();
      setModel(m);
      setLoading(false);
    };
    loadModel();
  }, []);

  React.useEffect(() => {
    if (!model || capturedImage) return;

    const interval = setInterval(async () => {
      const video = webcamRef.current?.video as HTMLVideoElement;
      if (
        !video ||
        video.readyState !== 4 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      const predictions = await model.estimateHands(video);
      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        const fingerCount = detectFingers(landmarks);
        setFingers(fingerCount);
      } else {
        setFingers(0);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [model, capturedImage]);

  React.useEffect(() => {
    if (countdown !== null || capturedImage) return;

    if (poseStep === 1 && fingers === 1) {
      setPoseStatus([true, false, false]);
      setPoseStep(2);
    } else if (poseStep === 2 && fingers === 2) {
      setPoseStatus([true, true, false]);
      setPoseStep(3);
    } else if (poseStep === 3 && fingers === 3) {
      setPoseStatus([true, true, true]);
      startCountdown();
    }
  }, [fingers, poseStep, countdown, capturedImage]);

  const startCountdown = () => {
    let counter = 3;
    setCountdown(counter);

    const timer = setInterval(() => {
      counter--;
      setCountdown(counter);

      if (counter === 0) {
        clearInterval(timer);
        captureImage();
      }
    }, 1000);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCountdown(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setPoseStep(1);
    setPoseStatus([false, false, false]);
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Raise Your Hand to Capture
          </DialogTitle>
          <DialogDescription className="text-xs">
            We’ll take the photo once your hand pose is detected.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-6 text-gray-500">
            <Loader2 className="animate-spin w-5 h-5 mr-2" /> Loading camera...
          </div>
        ) : capturedImage ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full object-cover"
            />
            <div className="flex gap-3 mt-3">
              <Button
                variant="outline"
                onClick={handleRetake}
                className="cursor-pointer"
              >
                Retake photo
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#01959F] hover:bg-[#027a83] text-white cursor-pointer"
              >
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 relative">
            <Webcam
              ref={webcamRef}
              mirrored
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full"
            />

            <p className="text-justify text-xs">
              To take a picture, follow the hand poses in the order shown below.
              The system will automatically capture the image once the final
              pose is detected.
            </p>

            <div className="flex gap-3 mt-2">
              {["/images/one.svg", "/images/two.svg", "/images/three.svg"].map(
                (src, i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`flex flex-col items-center justify-center w-16 h-w-16 border-2 transition-all ${
                        poseStatus[i]
                          ? "border-green-500 bg-green-50"
                          : "border-none bg-transparent"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`Pose ${i + 1}`}
                        width={1920}
                        height={1080}
                        className="object-cover rounded-md"
                      />
                    </div>
                    {i < 2 && (
                      <div className="flex items-center justify-center">
                        <ChevronRight className="text-gray-400 w-5 h-5" />
                      </div>
                    )}
                  </React.Fragment>
                )
              )}
            </div>

            {countdown !== null && (
              <div className="absolute top-0 left-0 w-full h-[400px] flex items-center justify-center bg-black/50 text-white text-6xl font-bold">
                {countdown}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function detectFingers(landmarks: number[][]) {
  const fingers = [8, 12, 16, 20];
  let count = 0;
  for (let i = 0; i < fingers.length; i++) {
    if (landmarks[fingers[i]][1] < landmarks[fingers[i] - 2][1]) count++;
  }
  return count;
}
