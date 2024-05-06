import { getCamera, drawVideo } from "./camera";
import "./style.css";
const camera = document.getElementById("camera");
const takePhoto = document.getElementById("take-photo");
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model;

camera.addEventListener(
  "click",

  async () => {
    const video = await getCamera();

    takePhoto.style.display = "inline";
    drawVideo(video);
  }
);

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
  context.fillText(inputTop.value, 10, 80); // Top
  context.fillText(inputBottom.value, 10, canvas.height - 80);
  inputTop.value = "";
  inputBottom.value = "";

  model = await cocoSsd.load();
  const predictions = await model.detect(meme);

  predictions.forEach((prediction) => {
    context.beginPath();
    context.rect(
      prediction.bbox[0],
      prediction.bbox[1],
      prediction.bbox[2],
      prediction.bbox[3]
    );
    context.lineWidth = 2;
    context.strokeStyle = "red";
    context.fillStyle = "red";
    context.stroke();
    context.fillText(
      `${prediction.class} ${prediction.score.toFixed(2)}`,
      prediction.bbox[0],
      prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
    );
  });

  camera.style.display = "none";
});
