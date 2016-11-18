const vscode = require('vscode');
const PromiseSeries = require('promise-series');

function activate(context) {
  const settings = vscode.workspace.getConfiguration('macros');
  const macros = Object.keys(settings).filter((prop) => {
    return prop !== 'has' && prop !== 'get' && prop !== 'update';
  });

  macros.forEach((name) => {
    const disposable = vscode.commands.registerCommand(`macros.${name}`, function () {
      const series = new PromiseSeries();
      settings[name].forEach((action) => {
        series.add(() => {
          vscode.commands.executeCommand(action);
        })
      })
      return series.run();
    })
    context.subscriptions.push(disposable);
  })
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;