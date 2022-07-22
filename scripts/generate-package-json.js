// Creates a `package.json` with `{ type: "module" }` inside the SvelteKit build files.
const fs = require("fs");
fs.writeFile(
  __dirname + "/../app/build/package.json",
  JSON.stringify({ type: "module" }),
  (err) => {
    if (err) console.log(err);
  }
);
