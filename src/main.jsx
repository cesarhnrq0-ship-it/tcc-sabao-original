import React from "react";
import { createRoot } from "react-dom/client";
import qrcode from "qrcode-generator";
import "./estilos.css";
import { App, Boundary } from "./App";

// O código do QR Code (PIX e produtos) procura a biblioteca em window.qrcode
window.qrcode = qrcode;

createRoot(document.getElementById("root")).render(
  <Boundary>
    <App />
  </Boundary>
);
