import React, { useEffect } from "react";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

document.getElementById("root")!.style.display = "none";

const [width, height] = [window.innerWidth, window.innerHeight];
const ratio = width / height;

const render = new WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(render.domElement);
const scene = new Scene();
const camera = new OrthographicCamera(
  width / -2,
  width / 2,
  height / 2,
  height / -2,
  1,
  1000
);
camera.position.z = 50;
const controls = new OrbitControls(camera, render.domElement);
controls.enableDamping = true;
const light = new PointLight();
light.position.set(2.5, 7.5, 15);
scene.add(light);

(function anime() {
  requestAnimationFrame(anime);
  controls.update();
  camera.updateMatrix();
  render.render(scene, camera);
})();

let objectId = 0;
function App() {
  useEffect(() => {
    const loader = new OBJLoader();
    loader.load("/assets/person.obj", function (group) {
      objectId = group.id;
      // group.applyMatrix4(new Matrix4().scale(new Vector3(15, 15, 15)));
      scene.add(group);
    });
  }, []);
  return null;
}

render.domElement.onwheel = function () {
  // console.log(camera.projectionMatrix.elements);
};

export default App;
