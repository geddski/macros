const vscode = require('vscode');

var activeContext;
var disposables = [];

function activate(context) {
  loadMacros(context);
  activeContext = context;
  vscode.workspace.onDidChangeConfiguration(() => {
    disposeMacros();
    loadMacros(activeContext);
  });
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

function executeDelayCommand(action) {
  return new Promise(resolve => {
    const milliseconds = Array.isArray(action.args) ? action.args[0] : 0;
    setTimeout(() => resolve(), milliseconds);
  });
}

function executeCommand(action) {
  // support objects so that we can pass arguments from user settings to the commands
  if (typeof action === 'object') {
    if (action.command === '$delay') {
      return executeDelayCommand(action);
    } else {
      return vscode.commands.executeCommand(action.command, action.args);
    }
  } else {
    // support commands as strings (no args)
    return vscode.commands.executeCommand(action);
  }
}

function loadMacros(context) {
  const settings = vscode.workspace.getConfiguration('macros');
  const macros = Object.keys(settings).filter(prop => {
    return prop !== 'has' && prop !== 'get' && prop !== 'update';
  });

  macros.forEach(name => {
    const disposable = vscode.commands.registerCommand(
      `macros.${name}`,
      function() {
        return settings[name].reduce(
          (promise, action) => promise.then(() => executeCommand(action)),
          Promise.resolve()
        );
      }
    );
    context.subscriptions.push(disposable);
    disposables.push(disposable);
  });
}

function disposeMacros() {
  for (var disposable of disposables) {
    disposable.dispose();
  }
}
