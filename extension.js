var vscode = require('vscode');
var request = require('request')

function pastebinPublish(textToPublish) {
    return new Promise((resolve, reject) => {
        let api_url = "http://pastebin.com/api/api_post.php";
        var data = {
            api_dev_key: 'b9ef14dea69d9902a4aa9cbdc6e2fe5e',
            api_option: 'paste',
            api_paste_code: textToPublish,
            api_paste_expire_date: '10M',
            /*api_paste_private: '1', // 0:public 1:unlisted 2:private
            api_paste_name: 'some_name',
            api_paste_format: "javascript",
            api_user_key: "" */
        };
        request.post(
            {
                url: api_url, 
                formData: data
            }, 
            (err, httpResponse, body) => {
                if (err)
                    reject(body);
                else
                    resolve(body);
            });
    });
    
}

function activate(context) {
    console.log('Congratulations, your extension "publish-my-code" is now active!');

    var disposable = vscode.commands.registerCommand('extension.PublishMyCode', function () {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let selection =  editor.selection;
        let text = editor.document.getText(selection);
        if (!text) {
            return;
        }  

        pastebinPublish(text).then(
            (result) => {
                vscode.window.showInformationMessage(result);
            },
            (error) => {
                vscode.window.showErrorMessage(error);
            }
        );
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

