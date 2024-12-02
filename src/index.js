const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

async function run() {
  try {
    // Get inputs
    const buildCommand = core.getInput('build_command') || 'npm run build:zip';
    const distDir = core.getInput('dist_dir', { required: true });

    // Run the build command and capture output
    const output = await exec.getExecOutput(buildCommand, [], { shell: true });

    // Extract zip filename from command output
    const zipFilename = output.stdout.match(/([^/\s]+\.zip) file generated!/)?.[1];
    if (!zipFilename) {
      throw new Error('Could not find ZIP filename in build command output');
    }

    const zipPath = path.join(distDir, zipFilename);

    // Verify ZIP file exists
    if (!fs.existsSync(zipPath)) {
      throw new Error(`ZIP file not found at expected path: ${zipPath}`);
    }

    // Set outputs
    core.setOutput('zip_file', zipPath);
    core.setOutput('filename', zipFilename);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
