import { getCamera, drawVideo } from "./camera";
import "./style.css";
const camera = document.getElementById("camera");
const takePhoto = document.getElementById("take-photo");
import "@tensorflow/tfjs";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

import * as faceDetection from "@tensorflow-models/face-detection";
import * as toxicity from "@tensorflow-models/toxicity";

//
camera.addEventListener(
  "click",

  async () => {
    const video = await getCamera();

    takePhoto.style.display = "inline";
    drawVideo(video);
  }
);

// takePhoto.addEventListener("click", async () => {
//   const canvas = document.getElementById("canvas");
//   const meme = document.getElementById("meme-canvas");
//   const inputTop = document.getElementById("meme-text-top");
//   const inputBottom = document.getElementById("meme-text-bottom");
//   meme.width = canvas.width;
//   meme.height = canvas.height;
//   const context = meme.getContext("2d");
//   context.drawImage(canvas, 0, 0, meme.width, meme.height);
//   context.font = "bold 48px serif";
//   context.fillStyle = "#fff";
//   context.fillText(inputTop.value, 10, 80); // Top
//   context.fillText(inputBottom.value, 10, canvas.height - 80);
//   inputTop.value = "";
//   inputBottom.value = "";

//   model = await cocoSsd.load();
//   const predictions = await model.detect(meme);
//   console.log(predictions);

//   predictions.forEach((prediction) => {
//     context.beginPath();
//     context.rect(
//       prediction.bbox[0],
//       prediction.bbox[1],
//       prediction.bbox[2],
//       prediction.bbox[3]
//     );
//     context.lineWidth = 2;
//     context.strokeStyle = "green";
//     context.fillStyle = "green";
//     context.stroke();
//     context.fillText(
//       `${prediction.class} ${prediction.score.toFixed(2)}`,
//       prediction.bbox[0],
//       prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
//     );
//   });

//   camera.style.display = "none";
// });

let model;
let detector;

// let handPosModel;

takePhoto.addEventListener("click", async () => {
  const canvas = document.getElementById("canvas");
  const meme = document.getElementById("meme-canvas");
  const inputTop = document.getElementById("meme-text-top");
  const inputBottom = document.getElementById("meme-text-bottom");

  meme.width = canvas.width;
  meme.height = canvas.height;
  const context = meme.getContext("2d");
  context.drawImage(canvas, 0, 0, meme.width, meme.height);
  context.font = "bold 48px serif";
  context.fillStyle = "#fff";

  const threshold = 0.9;
  const toxicityModel = await toxicity.load(threshold);
  const predictions = await toxicityModel.classify([
    inputTop.value,
    inputBottom.value,
  ]);
  console.log(predictions);

  // Flag to keep track if toxicity was detected
  let toxicityDetected = false;

  predictions.forEach((prediction) => {
    const { label, results } = prediction;
    results.forEach((result) => {
      if (result.match) {
        toxicityDetected = true; // Set the flag to true if toxicity detected
        context.fillText("⚠️ " + label, 10, 80);
        context.fillText("⚠️ " + label, 10, canvas.height - 80);
      }
    });
  });

  // Draw text only if no toxicity detected
  if (!toxicityDetected) {
    context.fillText(inputTop.value, 10, 80); // Top
    context.fillText(inputBottom.value, 10, canvas.height - 80);
  }

  inputTop.value = "";
  inputBottom.value = "";

  // Perform face detection
  await faceDetectionFn(context, meme);

  camera.style.display = "none";
});

async function faceDetectionFn(context, meme) {
  model = await faceDetection.SupportedModels.MediaPipeFaceDetector;
  detector = await faceDetection.createDetector(model, { runtime: "tfjs" });
  const pr = await detector.estimateFaces(meme);
  console.log(pr);

  pr.forEach((prediction) => {
    const { xMin, yMin, width, height } = prediction.box;
    const keypoints = prediction.keypoints;

    context.beginPath();
    context.rect(xMin, yMin, width, height);
    context.lineWidth = 2;
    context.strokeStyle = "green";
    context.fillStyle = "green";
    context.stroke();

    keypoints.forEach((keypoint) => {
      context.beginPath();
      context.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      context.fill();
    });
  });
}
