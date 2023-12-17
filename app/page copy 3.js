"use client";

import styles from "./page.module.scss";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // set up our WebGL context and append the canvas to our wrapper
    const curtains = new Curtains({
      container: "canvas",
    });
    // get our plane element
    const planeElement = document.getElementsByClassName("plane")[0];
    // set our initial parameters (basic uniforms)
    const params = {
      vertexShaderID: "plane-vs", // our vertex shader ID
      fragmentShaderID: "plane-fs", // our fragment shader ID
      uniforms: {
        time: {
          name: "uTime", // uniform name that will be passed to our shaders
          type: "1f", // this means our uniform is a float
          value: 0,
        },
      },
    };
    // create our plane using our curtains object, the HTML element and the parameters
    const plane = new Plane(curtains, planeElement, params);
    plane.onRender(() => {
      // use the onRender method of our plane fired at each requestAnimationFrame call
      plane.uniforms.time.value++; // update our time uniform value
    });
  }, []);
  return (
    <div className="img1Wrap">
      <img className="img1" src="/artistBgPoster1.png" />
      <div id="canvas"></div>
      <div class="plane"></div>
      <img src="path/to/my-image.jpg" crossorigin="" />
    </div>
  );
}
