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
                if (!err)
                    resolve(body);
                else
                    reject(body);
            }
        );
    });
}

function gistPublish(textToPublish) {
    return new Promise((resolve, reject) => {
        let api_url = "http://pastebin.com/api/api_post.php";
        var data = {
            "description": "the description for this gist",
            "public": true,
            "files": {
                "fileName": {
                    "content": textToPublish
                }
            }
        };

        request.post(
            {
                url: api_url,
                formData: data
            },
            (err, httpResponse, body) => {
                if (!err)
                    resolve(body);
                else
                    reject(body);
            }
        );
    });
}

//return selected text. If nothing is selected, ask to send whole document and return it if yes
function findTextToSend(editor) {
    return new Promise(resolve => {
        let selection = editor.selection;
        let selectedText = editor.document.getText(selection);

        if (selectedText) {
            resolve(selectedText);
        } else {
            vscode.window.showQuickPick(
                ['Yes', 'No'],
                { placeHolder: 'Are you sure that you want paste whole document?' }
            ).then(answer => {
                if (answer === 'Yes') {
                    resolve(editor.document.getText());
                }
            });
        }
    });
}

function activate(context) {
    console.log('Congratulations, your extension "publish-my-code" is now active!');

    var disposable = vscode.commands.registerCommand('extension.PublishMyCode', function () {       
        var editor = vscode.window.activeTextEditor;
        if (!editor) 
            return;
        var textToSend = "";

        Promise.resolve(editor)
        .then(
            editor => {  
                return findTextToSend(editor);
            })
        .then(
            text => {
                textToSend = text; //store text
                let siteItems = ['gist.github.com', 'pastebin.com'];
                return vscode.window.showQuickPick(siteItems);
            })
        .then(
            answer => {
                let senderFunction;           
                if (answer === 'gist.github.com') {
                    senderFunction = gistPublish;
                } else if (answer === 'pastebin.com') {
                    senderFunction = pastebinPublish;
                } else {
                    console.log('nothing was selected');
                    return;
                }
                return senderFunction(textToSend);
            })
        .then(
            result => {
                vscode.window.showInformationMessage(result);
            })
        .catch(
            error => {
                vscode.window.showErrorMessage(error);
            })
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;

