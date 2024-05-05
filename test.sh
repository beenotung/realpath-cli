set -e
out=$(./realpath.js --relative-to="$PWD/.." data/db.sqlite3)
expected="realpath-cli/data/db.sqlite3"
if [ "$out" != "$expected" ]; then
  echo "Error: expected output"
	echo "Expected: '$expected'"
	echo "Actual: '$out'"
	exit 1
fi
echo "Test Passed."
