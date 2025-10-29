declare module "*.css";
declare module "react-webcam" {
  import * as React from "react";

  export interface WebcamProps
    extends React.VideoHTMLAttributes<HTMLVideoElement> {
    audio?: boolean;
    mirrored?: boolean;
    screenshotFormat?: string;
    videoConstraints?: MediaTrackConstraints;
    screenshotQuality?: number;
    minScreenshotWidth?: number;
    minScreenshotHeight?: number;
    onUserMedia?: (stream: MediaStream) => void;
    onUserMediaError?: (error: string | DOMException) => void;
  }

  export default class Webcam extends React.Component<WebcamProps> {
    video: HTMLVideoElement | null;
    getScreenshot(): string | null;
  }
}

declare module "@tensorflow-models/handpose";
declare module "@tensorflow/tfjs-backend-webgl";
