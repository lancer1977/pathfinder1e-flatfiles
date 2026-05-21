#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/.." && pwd)"

echo "Running PF1 refresh smoke"
npm --prefix "${repo_root}" run refresh:all
npm --prefix "${repo_root}" run validate:all
npm --prefix "${repo_root}" run export:families

manifest="${repo_root}/exports/pf1-family-snapshots/manifest.json"
if [[ ! -f "${manifest}" ]]; then
  echo "Missing family export manifest: ${manifest}" >&2
  exit 1
fi

echo "PF1 refresh smoke passed"
