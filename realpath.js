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
  if (arg == '-s') {
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
  -s                  Treat the link symbolically instead of resolving it.
  --relative-to=path  Output the relative path with respect to the directory provided.
                      If no path is specified immediately after, it expects the next argument
                      to be the path.

Arguments:
  <file>              The file path to resolve to its absolute path.

Examples:
  realpath data/db.sqlite3
  realpath -s data/db.sqlite3
  realpath --relative-to="$PWD" data/db.sqlite3
  realpath -s --relative-to "$PWD" data/db.sqlite3

Description:
  This tool provides a way to use realpath functionality on macOS, similar to how it is used in Linux.
  It resolves the absolute path of the provided file, with optional handling for symbolic links and
  capability to provide paths relative to a specified directory.
`.trim(),
  )
  process.exit(0)
}

if (!options.file) {
  console.error('missing file in argument')
  process.exit(1)
}

let path = require('path')

let file = path.resolve(options.file)

if (options.relative_to) {
  let relative_to = path.resolve(options.relative_to)
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
