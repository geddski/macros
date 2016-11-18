let vscode = require('vscode');
let PromiseSeries = require('promise-series');

function activate(context) {
  const settings = vscode.workspace.getConfiguration('macros');
  const macros = Object.keys(settings).filter((prop) => {
    return prop !== 'has' && prop !== 'get' && prop !== 'update';
  });

  for (name of macros) {
    let disposable = vscode.commands.registerCommand(`macros.${name}`, function () {
      let series = new PromiseSeries();
      settings[name].forEach((action) => {
        series.add(() => {
          vscode.commands.executeCommand(action);
        })
      })
      return series.run();
    })
    context.subscriptions.push(disposable);
  }
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;