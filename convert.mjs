import sharp from "sharp"
import fs from "fs"
const svg = fs.readFileSync("C:/Users/LENOVO/Documents/ZenFX/zenfx-architecture.svg", "utf8")
sharp(Buffer.from(svg))
  .resize(1200, 840)
  .png()
  .toFile("C:/Users/LENOVO/Documents/ZenFX/zenfx-architecture.png")
  .then(() => console.log("SUCCESS: PNG created!"))
  .catch(e => console.error("ERROR:", e.message))
