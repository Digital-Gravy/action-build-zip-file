const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

// Mock the dependencies
jest.mock('@actions/core');
jest.mock('@actions/exec', () => ({
  getExecOutput: jest.fn(),
  exec: jest.fn(),
}));
jest.mock('fs');

describe('build-zip action', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    core.getInput.mockImplementation((name) => {
      if (name === 'dist_dir') return 'dist';
      if (name === 'build_command') return '';
      return '';
    });

    // Add mock for core.setFailed
    core.setFailed = jest.fn();

    fs.existsSync.mockReturnValue(true);
  });

  test('successfully builds and finds zip file', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... plugin.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    require('../src/index.js');
    await new Promise(process.nextTick);

    expect(exec.getExecOutput).toHaveBeenCalledWith('npm run build:zip', [], { shell: true });
    expect(core.setOutput).toHaveBeenCalledWith('filename', 'plugin.zip');
    expect(core.setOutput).toHaveBeenCalledWith('zip_file', path.join('dist', 'plugin.zip'));
  });

  test('fails when zip filename not found in output', async () => {
    // Setup the mock to return output without a zip filename
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... completed!',
      stderr: '',
      exitCode: 0,
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Wait for promises to resolve
    await new Promise(setImmediate);

    expect(core.setFailed).toHaveBeenCalledWith(
      'Could not find ZIP filename in build command output'
    );
  });

  test('fails when zip file does not exist', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... plugin.zip file generated!',
      stderr: '',
      exitCode: 0,
    });
    fs.existsSync.mockReturnValue(false);

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Wait for promises to resolve
    await new Promise(setImmediate);

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('ZIP file not found at expected path')
    );
  });

  test('uses custom build command when provided', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... custom.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    core.getInput.mockImplementation((name) => {
      if (name === 'dist_dir') return 'dist';
      if (name === 'build_command') return 'custom build command';
      return '';
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Wait for promises to resolve
    await new Promise(setImmediate);

    expect(exec.getExecOutput).toHaveBeenCalledWith('custom build command', [], { shell: true });
  });

  test('handles versioned zip filename', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... my-plugin-1.2.3.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Changed from process.nextTick to setImmediate
    await new Promise(setImmediate);

    expect(core.setOutput).toHaveBeenCalledWith('filename', 'my-plugin-1.2.3.zip');
    expect(core.setOutput).toHaveBeenCalledWith(
      'zip_file',
      path.join('dist', 'my-plugin-1.2.3.zip')
    );
  });

  test('handles prerelease version zip filename', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... my-plugin-2.0.0-beta.1.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Changed from process.nextTick to setImmediate
    await new Promise(setImmediate);

    expect(core.setOutput).toHaveBeenCalledWith('filename', 'my-plugin-2.0.0-beta.1.zip');
    expect(core.setOutput).toHaveBeenCalledWith(
      'zip_file',
      path.join('dist', 'my-plugin-2.0.0-beta.1.zip')
    );
  });

  test('handles complex filenames with dots and dashes', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... my.complex-plugin-v1.0.0-rc.2.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Changed from process.nextTick to setImmediate
    await new Promise(setImmediate);

    expect(core.setOutput).toHaveBeenCalledWith('filename', 'my.complex-plugin-v1.0.0-rc.2.zip');
    expect(core.setOutput).toHaveBeenCalledWith(
      'zip_file',
      path.join('dist', 'my.complex-plugin-v1.0.0-rc.2.zip')
    );
  });

  test('handles prerelease version with hyphen suffix', async () => {
    exec.getExecOutput.mockResolvedValue({
      stdout: 'Building... my-plugin-1.2.3-alpha-1.zip file generated!',
      stderr: '',
      exitCode: 0,
    });

    // Clear any cached version of the module
    jest.isolateModules(() => {
      require('../src/index.js');
    });

    // Changed from process.nextTick to setImmediate
    await new Promise(setImmediate);

    expect(core.setOutput).toHaveBeenCalledWith('filename', 'my-plugin-1.2.3-alpha-1.zip');
    expect(core.setOutput).toHaveBeenCalledWith(
      'zip_file',
      path.join('dist', 'my-plugin-1.2.3-alpha-1.zip')
    );
  });
});
