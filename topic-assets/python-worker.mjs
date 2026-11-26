import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs";

let pyodide;
let pyodideReady;
let streamsReady = false;

async function initializePython() {
  if (!pyodideReady) pyodideReady = loadPyodide();
  pyodide = await pyodideReady;
  if (!streamsReady) {
    pyodide.setStdout({batched: text => self.postMessage({type: 'stdout', text})});
    pyodide.setStderr({batched: text => self.postMessage({type: 'stderr', text})});
    streamsReady = true;
  }
  return pyodide;
}

self.onmessage = async event => {
  const request = event.data || {};
  if (request.type !== 'run') return;
  try {
    const runtime = await initializePython();
    const inputLines = String(request.stdin || '').split(/\r?\n/);
    let inputIndex = 0;
    runtime.setStdin({
      stdin: () => inputIndex < inputLines.length ? inputLines[inputIndex++] : undefined,
      isatty: true
    });
    await runtime.loadPackagesFromImports(request.code);
    const dict = runtime.globals.get('dict');
    const globals = dict([['__name__', '__main__']]);
    try {
      await runtime.runPythonAsync(request.code, {globals});
      self.postMessage({type: 'done'});
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({type: 'error', text: error && error.message ? error.message : String(error)});
  }
};

initializePython()
  .then(() => self.postMessage({type: 'ready'}))
  .catch(error => self.postMessage({
    type: 'load-error',
    text: error && error.message ? error.message : String(error)
  }));
