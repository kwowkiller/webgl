import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Star from "./components/Star";
import Triangle from "./components/Triangle";
import Shape from "./components/Shape";
import Rotate from "./components/Rotate";
import Matrix from "./components/Matrix";
import Cube from "./components/Cube";
import Wave from "./components/Wave";
import Colors from "./components/Colors";
import Texture from "./components/Texture";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const pages: { path: string; element: JSX.Element }[] = [
  { path: "/star", element: <Star /> },
  { path: "/triangle", element: <Triangle /> },
  { path: "/shape", element: <Shape /> },
  { path: "/rotate", element: <Rotate /> },
  { path: "/matrix", element: <Matrix /> },
  { path: "/cube", element: <Cube /> },
  { path: "/wave", element: <Wave /> },
  { path: "/colors", element: <Colors /> },
  { path: "/texture", element: <Texture /> },
];
root.render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <ul>
            {pages.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.path}</Link>
              </li>
            ))}
          </ul>
        }
      />
      {pages.map((item) => (
        <Route key={item.path} path={item.path} element={item.element} />
      ))}
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
