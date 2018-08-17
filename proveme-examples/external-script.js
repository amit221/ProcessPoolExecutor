const images = require("images");
const args = require("args");
images.setLimit(99999, 99999);
args
  .option('image', "Absolute File Path")
  .option('cover', "Absolute Cover File Path");

const parsedArgs = args.parse(process.argv);

console.log({parsedArgs});

const {
  image,
  cover,
} = parsedArgs;

const original = images(image);
original
  .draw(
    images(cover)
    .size(original.width(), original.height()), 0, 0
  );

