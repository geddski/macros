let vscode = require('vscode');
function activate(context) {
    const settings = vscode.workspace.getConfiguration('macros');
    const macros = Object.keys(settings).filter((prop) => {
        return prop !== 'has' && prop !== 'get' && prop !== 'update';
    })

    for (name of macros){
      let disposable = vscode.commands.registerCommand(`macros.${name}`, function () {
        return Promise.all(settings[name].map(vscode.commands.executeCommand));
      })
      context.subscriptions.push(disposable);
    }
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;