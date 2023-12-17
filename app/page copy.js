"use client";

// import Image from "next/image";
import styles from "./page.module.scss";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    var controls = [];
    var canvas;
    var context;
    let image;
    var triangles = [];
    var dirtyTriangles = true;

    var rand = function (s, e) {
      return Math.random() * (e - s) + s;
    };

    // dom ready
    // console.log(new Image());
    image = new Image();
    setInterval(draw, 1000 / 60);
    image.addEventListener("load", function () {
      setInterval(draw, 1000 / 60);
    });
    image.src = "/artistBgPoster1.png";

    canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);

    context = canvas.getContext("2d");

    //
    for (var i = 0; i < 4; ++i) {
      var control = document.createElement("div");
      control.classList.add("node");
      document.body.append(control);
      controls.push(control);
    }

    controls[0].style.left = rand(25, 225) + "px";
    controls[0].style.top = rand(25, 225) + "px";

    controls[1].style.left = rand(250, 475) + "px";
    controls[1].style.top = rand(25, 225) + "px";

    controls[2].style.left = rand(250, 475) + "px";
    controls[2].style.top = rand(250, 475) + "px";

    controls[3].style.left = rand(25, 225) + "px";
    controls[3].style.top = rand(250, 475) + "px";

    function mouseDownFunc(e) {
      console.log("run");
      if (e.target.classList.contains("node")) {
        var node = e.target;
        console.log(node);
        document.body.addEventListener("mousemove", function (e) {
          var x = e.pageX;
          var y = e.pageY;
          node.style.left = x + "px";
          node.style.top = y + "px";
          dirtyTriangles = true;
        });
      }
    }
    document.body.addEventListener("mousedown", mouseDownFunc);
    document.body.addEventListener("mouseup", mouseUp);
    function mouseUp(e) {
      console.log("mouseup");
      document.body.removeEventListener("mousemove", mouseDownFunc);
      document.body.removeEventListener("mousedown", mouseDownFunc);
    }

    var draw = function () {
      context.clearRect(0, 0, 500, 500);

      var render = function (wireframe, image, tri) {
        if (wireframe) {
          context.strokeStyle = "black";
          context.beginPath();
          context.moveTo(tri.p0.x, tri.p0.y);
          context.lineTo(tri.p1.x, tri.p1.y);
          context.lineTo(tri.p2.x, tri.p2.y);
          context.lineTo(tri.p0.x, tri.p0.y);
          context.stroke();
          context.closePath();
        }

        if (image) {
          drawTriangle(
            context,
            image,
            tri.p0.x,
            tri.p0.y,
            tri.p1.x,
            tri.p1.y,
            tri.p2.x,
            tri.p2.y,
            tri.t0.u,
            tri.t0.v,
            tri.t1.u,
            tri.t1.v,
            tri.t2.u,
            tri.t2.v
          );
        }
      };

      if (dirtyTriangles) {
        dirtyTriangles = false;
        calculateGeometry();
      }

      for (var i = 0; i < triangles.length; i++) {
        render(true, image, triangles[i]);
      }
    };

    var calculateGeometry = function () {
      // clear triangles out
      triangles = [];

      // generate subdivision
      var subs = 7; // vertical subdivisions
      var divs = 7; // horizontal subdivisions

      var p1 = new Point(
        parseInt(controls[0].style.left) + 6,
        parseInt(controls[0].style.top) + 6
      );
      var p2 = new Point(
        parseInt(controls[1].style.left) + 6,
        parseInt(controls[1].style.top) + 6
      );
      var p3 = new Point(
        parseInt(controls[2].style.left) + 6,
        parseInt(controls[2].style.top) + 6
      );
      var p4 = new Point(
        parseInt(controls[3].style.left) + 6,
        parseInt(controls[3].style.top) + 6
      );

      var dx1 = p4.x - p1.x;
      var dy1 = p4.y - p1.y;
      var dx2 = p3.x - p2.x;
      var dy2 = p3.y - p2.y;

      var imgW = image.naturalWidth;
      var imgH = image.naturalHeight;

      for (var sub = 0; sub < subs; ++sub) {
        var curRow = sub / subs;
        var nextRow = (sub + 1) / subs;

        var curRowX1 = p1.x + dx1 * curRow;
        var curRowY1 = p1.y + dy1 * curRow;

        var curRowX2 = p2.x + dx2 * curRow;
        var curRowY2 = p2.y + dy2 * curRow;

        var nextRowX1 = p1.x + dx1 * nextRow;
        var nextRowY1 = p1.y + dy1 * nextRow;

        var nextRowX2 = p2.x + dx2 * nextRow;
        var nextRowY2 = p2.y + dy2 * nextRow;

        for (var div = 0; div < divs; ++div) {
          var curCol = div / divs;
          var nextCol = (div + 1) / divs;

          var dCurX = curRowX2 - curRowX1;
          var dCurY = curRowY2 - curRowY1;
          var dNextX = nextRowX2 - nextRowX1;
          var dNextY = nextRowY2 - nextRowY1;

          var p1x = curRowX1 + dCurX * curCol;
          var p1y = curRowY1 + dCurY * curCol;

          var p2x = curRowX1 + (curRowX2 - curRowX1) * nextCol;
          var p2y = curRowY1 + (curRowY2 - curRowY1) * nextCol;

          var p3x = nextRowX1 + dNextX * nextCol;
          var p3y = nextRowY1 + dNextY * nextCol;

          var p4x = nextRowX1 + dNextX * curCol;
          var p4y = nextRowY1 + dNextY * curCol;

          var u1 = curCol * imgW;
          var u2 = nextCol * imgW;
          var v1 = curRow * imgH;
          var v2 = nextRow * imgH;

          var triangle1 = new Triangle(
            new Point(p1x, p1y),
            new Point(p3x, p3y),
            new Point(p4x, p4y),
            new TextCoord(u1, v1),
            new TextCoord(u2, v2),
            new TextCoord(u1, v2)
          );

          var triangle2 = new Triangle(
            new Point(p1x, p1y),
            new Point(p2x, p2y),
            new Point(p3x, p3y),
            new TextCoord(u1, v1),
            new TextCoord(u2, v1),
            new TextCoord(u2, v2)
          );

          triangles.push(triangle1);
          triangles.push(triangle2);
        }
      }
    };

    // from http://tulrich.com/geekstuff/canvas/jsgl.js
    var drawTriangle = function (
      ctx,
      im,
      x0,
      y0,
      x1,
      y1,
      x2,
      y2,
      sx0,
      sy0,
      sx1,
      sy1,
      sx2,
      sy2
    ) {
      ctx.save();

      // Clip the output to the on-screen triangle boundaries.
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      //ctx.stroke();//xxxxxxx for wireframe
      ctx.clip();

      /*
        ctx.transform(m11, m12, m21, m22, dx, dy) sets the context transform matrix.
    
        The context matrix is:
    
        [ m11 m21 dx ]
        [ m12 m22 dy ]
        [  0   0   1 ]
    
        Coords are column vectors with a 1 in the z coord, so the transform is:
        x_out = m11 * x + m21 * y + dx;
        y_out = m12 * x + m22 * y + dy;
    
        From Maxima, these are the transform values that map the source
        coords to the dest coords:
    
        sy0 (x2 - x1) - sy1 x2 + sy2 x1 + (sy1 - sy2) x0
        [m11 = - -----------------------------------------------------,
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
    
        sy1 y2 + sy0 (y1 - y2) - sy2 y1 + (sy2 - sy1) y0
        m12 = -----------------------------------------------------,
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
    
        sx0 (x2 - x1) - sx1 x2 + sx2 x1 + (sx1 - sx2) x0
        m21 = -----------------------------------------------------,
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
    
        sx1 y2 + sx0 (y1 - y2) - sx2 y1 + (sx2 - sx1) y0
        m22 = - -----------------------------------------------------,
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
    
        sx0 (sy2 x1 - sy1 x2) + sy0 (sx1 x2 - sx2 x1) + (sx2 sy1 - sx1 sy2) x0
        dx = ----------------------------------------------------------------------,
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
    
        sx0 (sy2 y1 - sy1 y2) + sy0 (sx1 y2 - sx2 y1) + (sx2 sy1 - sx1 sy2) y0
        dy = ----------------------------------------------------------------------]
        sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
      */

      // TODO: eliminate common subexpressions.
      var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
      if (denom == 0) {
        return;
      }
      var m11 =
        -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
      var m12 =
        (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
      var m21 =
        (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
      var m22 =
        -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
      var dx =
        (sx0 * (sy2 * x1 - sy1 * x2) +
          sy0 * (sx1 * x2 - sx2 * x1) +
          (sx2 * sy1 - sx1 * sy2) * x0) /
        denom;
      var dy =
        (sx0 * (sy2 * y1 - sy1 * y2) +
          sy0 * (sx1 * y2 - sx2 * y1) +
          (sx2 * sy1 - sx1 * sy2) * y0) /
        denom;

      ctx.transform(m11, m12, m21, m22, dx, dy);

      // Draw the whole image.  Transform and clip will map it onto the
      // correct output triangle.
      //
      // TODO: figure out if drawImage goes faster if we specify the rectangle that
      // bounds the source coords.
      ctx.drawImage(im, 0, 0);
      ctx.restore();
    };

    // point class

    var Point = function (x, y) {
      this.x = x ? x : 0;
      this.y = y ? y : 0;
    };

    var p = Point.prototype;

    p.length = function (point) {
      point = point ? point : new Point();
      var xs = 0,
        ys = 0;
      xs = point.x - this.x;
      xs = xs * xs;

      ys = point.y - this.y;
      ys = ys * ys;
      return Math.sqrt(xs + ys);
    };

    var TextCoord = function (u, v) {
      this.u = u ? u : 0;
      this.v = v ? v : 0;
    };

    var Triangle = function (p0, p1, p2, t0, t1, t2) {
      this.p0 = p0;
      this.p1 = p1;
      this.p2 = p2;

      this.t0 = t0;
      this.t1 = t1;
      this.t2 = t2;
    };
  }, []);
  return (
    <div className="img1Wrap">
      <img className="img1" src="/artistBgPoster1.png" />
    </div>
  );
}
