const vscode = require('vscode');
const PromiseSeries = require('promise-series');

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

function deactivate() {
}
exports.deactivate = deactivate;

function loadMacros(context) {
  const settings = vscode.workspace.getConfiguration('macros');
  const macros = Object.keys(settings).filter((prop) => {
    return prop !== 'has' && prop !== 'get' && prop !== 'update';
  });

  macros.forEach((name) => {
    const disposable = vscode.commands.registerCommand(`macros.${name}`, function () {
      const series = new PromiseSeries();
      settings[name].forEach((action) => {
        series.add(() => {
          // support objects so that we can pass arguments from user settings to the commands
          if (typeof action === "object"){
            return vscode.commands.executeCommand(action.command, action.args);
          }
          // support commands as strings (no args)
          else{
            return vscode.commands.executeCommand(action);
          }
        })
      })
      return series.run();
    })
    context.subscriptions.push(disposable);
    disposables.push(disposable);
  });
}

function disposeMacros() {
  for (var disposable of disposables) {
    disposable.dispose();
  }
}
