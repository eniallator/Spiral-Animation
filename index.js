const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const spirals = [
  { scale: 10, colour: [1, 0, 0] },
  { scale: 15, colour: [0, 1, 0] },
  { scale: 20, colour: [0, 0, 1] },
];

const paramConfig = new ParamConfig(
  "./config.json",
  document.querySelector("#cfg-outer")
);
paramConfig.addCopyToClipboardHandler("#share-btn");

const createSpirals = (time = 0) =>
  tf.tidy(() => {
    const xCoordsDist = tf
      .range(0, canvas.width)
      .tile([canvas.height])
      .reshape([canvas.height, canvas.width])
      .sub((canvas.width - 1) / 2);
    const yCoordsDist = tf
      .range(0, canvas.height)
      .tile([canvas.width])
      .reshape([canvas.width, canvas.height])
      .transpose()
      .sub((canvas.height - 1) / 2);
    const magnitude = tf.sqrt(
      tf.add(xCoordsDist.square(), yCoordsDist.square())
    );
    let bearing = tf.atan(tf.abs(yCoordsDist.div(xCoordsDist)));
    const negativeBearing = bearing.mul(-1);

    const xSign = xCoordsDist.greaterEqual(0);
    const ySign = yCoordsDist.greaterEqual(0);
    bearing = tf.where(
      tf.logicalAnd(xSign, ySign),
      negativeBearing.add(Math.PI * 0.5),
      bearing
    );
    bearing = tf.where(
      tf.logicalAnd(xSign, ySign.logicalNot()),
      bearing.add(Math.PI * 0.5),
      bearing
    );
    bearing = tf.where(
      tf.logicalAnd(xSign.logicalNot(), ySign.logicalNot()),
      negativeBearing.add(Math.PI * 1.5),
      bearing
    );
    bearing = tf.where(
      tf.logicalAnd(xSign.logicalNot(), ySign),
      bearing.add(Math.PI * 1.5),
      bearing
    );
    let imgData = tf.zeros([canvas.height, canvas.width, 3]);
    for (let spiral of spirals) {
      const wave = tf.abs(
        tf.sin(
          magnitude
            .div(spiral.scale * paramConfig.getVal("scale"))
            .add(bearing)
            .sub(time)
        )
      );
      imgData = imgData.add(
        wave
          .reshape([...wave.shape, 1])
          .mul(tf.tensor(spiral.colour).reshape([1, 1, 3]))
      );
    }
    return tf.keep(imgData.minimum(1));
  });

window.onresize = (evt) => {
  canvas.width = $("#canvas").width();
  canvas.height = $("#canvas").height();
};
window.onresize();

let imgData;
let time = 0;
const run = () => {
  tf.disposeVariables();
  imgData?.dispose();
  time += paramConfig.getVal("speed");
  imgData = createSpirals(time);

  tf.browser.toPixels(imgData, canvas).then(() => requestAnimationFrame(run));
};

paramConfig.onLoad(run);
