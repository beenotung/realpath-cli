#!/usr/bin/env node

let args = process.argv

let options = {
  symbolic: false,
  relative_to: '',
  file: '',
  help: false,
  version: false,
}

for (let i = 2; i < args.length; i++) {
  let arg = args[i]
  if (arg == '-h' || arg == '--help') {
    options.help = true
    break
  }
  if (arg == '-v' || arg == '--version') {
    options.version = true
    break
  }
  if (arg == '-s' || arg === '--strip' || arg === '--no-symlinks') {
    options.symbolic = true
    continue
  }
  if (arg.startsWith('--relative-to')) {
    if (arg.startsWith('--relative-to=')) {
      options.relative_to = arg.slice('--relative-to='.length)
    } else {
      i++
      arg = args[i]
      if (!arg) {
        console.error('missing file for --relative-to argument')
        process.exit(1)
      }
      options.relative_to = arg
    }
    continue
  }
  if (!options.file) {
    options.file = arg
    continue
  }
  console.error('extra argument:', arg)
  process.exit(1)
}

if (options.version) {
  console.log('realpath-cli v1')
  process.exit(0)
}

if (options.help) {
  console.log(
    `
realpath-cli - Node.js shim of the Linux-style realpath command for macOS compatibility.

Usage: realpath [options] <file>

Options:
  -h, --help          Display this help message and exit.
  -v, --version       Output version information and exit.
  -s, --strip,
      --no-symlinks   Do not expand symbolic links.
  --relative-to=path  Output the relative path with respect to the directory provided.
                      If no path specified immediately after, it expects the next argument
                      to be the path.

Arguments:
  <file>              The file path to resolve to its absolute path.

Examples:
  realpath data/db.sqlite3
  realpath -s data/db.sqlite3
  realpath --relative-to="$PWD" data/db.sqlite3
  realpath -s --relative-to "$PWD" data/db.sqlite3

Description:
  By default symlink targets are expanded when possible (similar to GNU realpath).
  Use -s, --strip, or --no-symlinks for path normalization without following symlinks.
`.trim(),
  )
  process.exit(0)
}

if (!options.file) {
  console.error('missing file in argument')
  process.exit(1)
}

let fs = require('fs')
let path = require('path')

function resolvedPath(target) {
  if (options.symbolic) {
    return path.resolve(target)
  }
  try {
    return fs.realpathSync(target)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(e.message)
      process.exit(1)
    }
    let dir = path.dirname(target)
    if (dir === target) {
      console.error(e.message)
      process.exit(1)
    }
    try {
      let dirCanon = fs.realpathSync(dir)
      return path.normalize(path.join(dirCanon, path.basename(target)))
    } catch (_) {
      console.error(e.message)
      process.exit(1)
    }
  }
}

let file = resolvedPath(options.file)

if (options.relative_to) {
  let relative_to = resolvedPath(options.relative_to)
  let relative_parts = relative_to.split('/')
  let file_parts = file.split('/')
  while (
    relative_parts.length > 0 &&
    file_parts.length > 0 &&
    relative_parts[0] == file_parts[0]
  ) {
    relative_parts.shift()
    file_parts.shift()
  }
  let parts = [...relative_parts.map(_ => '..'), ...file_parts]
  file = path.join(...parts)
}

console.log(file)
