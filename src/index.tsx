import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Star from "./components/Star";
import Triangle from "./components/Triangle";
import Shape from "./components/Shape";
import Rorate from "./components/Rorate";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/star" element={<Star />} />
      <Route path="/triangle" element={<Triangle />} />
      <Route path="/shape" element={<Shape />} />
      <Route path="/rorate" element={<Rorate />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
