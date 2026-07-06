const fs = require("fs")
const path = require("path")

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file)
    try {
      filelist = walkSync(dirFile, filelist)
    } catch (err) {
      if (err.code === "ENOTDIR" || err.code === "EBADF") filelist.push(dirFile)
    }
  })
  return filelist
}

const dirs = ["components", "utils", "contacts", "app"]
let files = []
dirs.forEach((d) => {
  files = files.concat(walkSync(path.join(__dirname, "..", d)))
})

files
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  .forEach((file) => {
    let content = fs.readFileSync(file, "utf8")

    // Purge non-docstring comments (// comments)
    // We must be careful not to purge URLs like https://...
    content = content.replace(/(?<!https?:)\/\/.*$/gm, "")

    fs.writeFileSync(file, content)
  })

console.log("Comments refactor complete")
