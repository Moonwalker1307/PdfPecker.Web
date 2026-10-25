#!/usr/bin/env bash
# Checks that the running API turns bad requests into clear client errors (never a 500 or a hang), sends its security
# headers, and still answers afterwards. CI runs it against the Docker image; run it locally against a running app:
#   tools/check-api.sh http://localhost:8080
set -euo pipefail
base="${1:-http://localhost:8080}"
failed=0

# expect <status> <description> <curl arguments...>
expect() {
  local want="$1" what="$2"
  shift 2
  local got
  got=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 60 "$@" || echo "no answer")
  if [ "$got" = "$want" ]; then
    echo "ok    $what: $got"
  else
    echo "::error::$what: expected $want, got $got"
    failed=1
  fi
}

expect 200 "small HTML document" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"html":"<h1>Hello</h1>"}'
expect 200 "Markdown to HTML" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"markdown":"# Hello","output":"html"}'
expect 400 "broken JSON" -X POST "$base/api/convert" -H 'Content-Type: application/json' --data '{"html":'
expect 400 "empty document" -X POST "$base/api/convert" -H 'Content-Type: application/json' --data '{"html":"  "}'
expect 400 "unknown output" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"html":"<p>x","output":"exe"}'
expect 400 "HTML output for HTML input" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"html":"<p>x","output":"html"}'
expect 400 "maxPages out of range" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"html":"<p>x","options":{"maxPages":100000}}'
expect 400 "over-long watermark" -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data "{\"html\":\"<p>x\",\"watermark\":\"$(printf 'w%.0s' $(seq 1 300))\"}"

# A body over the 5 MB limit is refused before it is read.
head -c $((6 * 1024 * 1024)) /dev/zero | tr '\0' 'x' > /tmp/check-api-large.html
expect 413 "body over 5 MB" -X POST "$base/api/convert" -H 'Content-Type: text/html' --data-binary @/tmp/check-api-large.html
rm -f /tmp/check-api-large.html

expect 422 "PDF to image with a file that is not a PDF" -X POST "$base/api/pdf-to-image" \
  -H 'Content-Type: application/pdf' --data-binary 'this is not a PDF'
expect 400 "PDF to image with no file" -X POST "$base/api/pdf-to-image" -F 'note=nothing'

# The PDF tools: a small PDF made above, then requests that must fail cleanly.
curl -sS -X POST "$base/api/convert" -H 'Content-Type: application/json' \
  --data '{"html":"<p>one</p><p style=\"page-break-before:always\">two</p>"}' -o /tmp/check-api-small.pdf
expect 200 "merge two PDFs" -X POST "$base/api/merge" -F 'file=@/tmp/check-api-small.pdf' -F 'file=@/tmp/check-api-small.pdf' \
  -F 'pages=' -F 'pages=2,1'
expect 400 "merge one PDF" -X POST "$base/api/merge" -F 'file=@/tmp/check-api-small.pdf'
expect 200 "reorder and rotate pages" -X POST "$base/api/pages?pages=2,1&rotate=90,0" -H 'Content-Type: application/pdf' \
  --data-binary @/tmp/check-api-small.pdf
expect 400 "page past the end" -X POST "$base/api/pages?pages=9" -H 'Content-Type: application/pdf' --data-binary @/tmp/check-api-small.pdf
expect 400 "rotate that is not a quarter turn" -X POST "$base/api/pages?pages=1&rotate=45" -H 'Content-Type: application/pdf' \
  --data-binary @/tmp/check-api-small.pdf
expect 400 "no pages to keep" -X POST "$base/api/pages" -H 'Content-Type: application/pdf' --data-binary @/tmp/check-api-small.pdf
expect 200 "compress" -X POST "$base/api/compress?level=balanced" -H 'Content-Type: application/pdf' --data-binary @/tmp/check-api-small.pdf
expect 400 "unknown compress level" -X POST "$base/api/compress?level=max" -H 'Content-Type: application/pdf' \
  --data-binary @/tmp/check-api-small.pdf
expect 422 "compress a file that is not a PDF" -X POST "$base/api/compress" -H 'Content-Type: application/pdf' --data-binary 'not a PDF'
expect 200 "page thumbnails" -X POST "$base/api/pdf-thumbnails" -F 'file=@/tmp/check-api-small.pdf'
expect 400 "thumbnails with no file" -X POST "$base/api/pdf-thumbnails" -H 'Content-Type: application/pdf'
rm -f /tmp/check-api-small.pdf

# The headers that keep the site from being framed or running other sites' scripts.
headers=$(curl -sS -D - -o /dev/null "$base/")
for h in Content-Security-Policy X-Content-Type-Options X-Frame-Options Referrer-Policy; do
  if grep -qi "^$h:" <<< "$headers"; then echo "ok    header $h"; else echo "::error::header $h is missing"; failed=1; fi
done
if grep -qi '^Server:' <<< "$headers"; then echo "::error::the Server header gives away the web server"; failed=1; fi

expect 200 "health after the bad requests" "$base/health"
exit $failed
