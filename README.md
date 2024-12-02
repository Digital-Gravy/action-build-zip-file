# Build ZIP File Action

[![Tests](https://github.com/Digital-Gravy/action-build-zip-file/actions/workflows/test.yml/badge.svg)](https://
github.com/Digital-Gravy/action-build-zip-file/actions/workflows/test.yml)

A GitHub Action that executes a build command and locates the generated ZIP file, providing its path and filename as outputs. This action is particularly useful for build processes that generate ZIP archives, such as WordPress plugin/theme builds or other packaged distributions.

## Features

- Executes a configurable build command
- Automatically detects the generated ZIP filename from build output
- Verifies ZIP file existence
- Supports custom build directories
- Handles various ZIP filename formats including versioned files

## Usage

Add the following step to your workflow:

```yaml
- name: Build ZIP File
  uses: Digital-Gravy/action-build-zip-file@v1
  with:
    build_command: 'npm run build:zip'
    dist_dir: 'dist'
```

### Inputs

| Input           | Description                                    | Required | Default             |
| --------------- | ---------------------------------------------- | -------- | ------------------- |
| `build_command` | Command to execute to build the ZIP file       | No       | 'npm run build:zip' |
| `dist_dir`      | Directory where the ZIP file will be generated | Yes      | -                   |

### Outputs

| Output     | Description                       |
| ---------- | --------------------------------- |
| `zip_file` | Full path to the created ZIP file |
| `filename` | Name of the created ZIP file      |

### Example Workflow

Here's a complete example of how to use this action in a workflow:

```yaml
name: Build and Package

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build ZIP
        id: build-zip
        uses: Digital-Gravy/action-build-zip-file@v1
        with:
          dist_dir: 'dist'
          build_command: 'npm run build:zip'

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: release-zip
          path: ${{ steps.build-zip.outputs.zip_file }}
```

## Requirements

- The build command must output a message containing the ZIP filename followed by "file generated!"
  - Example: `my-plugin.zip file generated!`
- The ZIP file must be created in the specified `dist_dir`

## Supported ZIP Filename Patterns

The action supports various ZIP filename patterns, including:

- Simple: `plugin.zip`
- Versioned: `my-plugin-1.2.3.zip`
- Prerelease versions: `my-plugin-2.0.0-beta.1.zip`
- Complex names: `my.complex-plugin-v1.0.0-rc.2.zip`
- Hyphenated prereleases: `my-plugin-1.2.3-alpha-1.zip`

## Error Handling

The action will fail with an error message if:

- The ZIP filename cannot be extracted from the build command output
- The ZIP file is not found in the specified directory after build
- The build command fails to execute

## License

GPLv3 - see LICENSE file for details
