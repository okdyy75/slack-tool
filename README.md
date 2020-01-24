
# slack-tool
Slack to GASのSlash Commandsです

## 参考サイト
clasp公式  
https://github.com/google/clasp

Slash CommandsとGASでSlackのオリジナルコマンドをつくる  
https://qiita.com/chikuwa111/items/7a1a349b82318a5861cc

## 構築手順

### Macにclaspをグローバルインストール
```
sudo npm install -g @google/clasp
```

### GASプロジェクト作成
```
mkdir [project]
cd [project]
clasp create [project]
```

どのscriptを作成するか聞かれるのでwebappを選択
```bash
? Create which script? (Use arrow keys)
  standalone 
  docs 
  sheets 
  slides 
  forms 
❯ webapp 
  api
```

gsファイルを補完するためにnpmパッケージインストール
```
npm init -y
npm i @types/google-apps-script --save-dev
```

プロジェクトを開くとgsファイルが作成されるのでpull
```
clasp open

clasp pull
```

### Slack連携ファイル作成

今回作るコマンドは翻訳コマンド  
「/honyaku This is Pen」と入力すると「これはペンです」と返ってくるものを作ります  
ソースファイルの対象フォルダをsrcに変更しinde.jsを作成

.clasp.json
```json
{
    "scriptId": "XXXXX",
    "rootDir": "src"
}
```

src/index.js
```js
/**
 * GASプロジェクトのプロパティー（環境変数）
 */
SLACK_VERIFICATION_TOKEN = PropertiesService.getScriptProperties().getProperty("SLACK_VERIFICATION_TOKEN");

/**
 * GETリクエスト
 * 
 * @param {any} e 
 * @return {GoogleAppsScript.Content.TextOutput} text
 */
function doGet(e) {
    return ContentService.createTextOutput('slack-tool v1')
}

/**
 * POSTリクエスト
 * 
 * @param {any} e 
 * @return {GoogleAppsScript.Content.TextOutput} json
 */
function doPost(e) {
    var verificationToken = e.parameter.token
    var command = e.parameter.text

    if (verificationToken != SLACK_VERIFICATION_TOKEN) {
        throw new Error('Invalid token')
    }

    var text = ''
    switch (true) {
        case /^honyaku/.test(command):

            var args = command.split(/^honyaku /)[1]
            text = LanguageApp.translate(args, 'en', 'ja')
            break;
        default:

            text = '正しくコマンドが指定されませんでした'
            break;
    }


    var response = { text: text }

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
}
```

ソースファイルを編集後push

```bash
clasp push
```

GitHub等に秘匿情報をそのまま上げるのはセキュリティー的に宜しくないので、GASプロジェクトにプロパティー（環境変数）を追加して、それを使用しましょう。

### 外部APIとして公開

1. webappとして公開するにはスプレッドシートから直接公開する必要があるので`clasp open`
2. openしたgasファイル上で「ウェブアプリケーションとして導入」を選択。
  バージョンも最新でなければ反映されないので、Project versionを「New」、Who has access to the appを「Anyone even anonymous」で公開する

## VS CodeのREST Clientで動作確認

Rest Client用ファイルを作成  
どうやらリダイレクトされているようなのでリクエスト後のLocationを受け取って、さらにそこにアクセス

.vscode/gas.rest
```
@deployKey = XXXXX

###
# @name gas_post
POST https://script.google.com/macros/s/{{deployKey}}/exec
?token=XXXXX
&text=honyaku This is Pen

###
# @name gas_post_location
GET {{gas_post.response.headers.Location}}
```

ちゃんと返ってきてる
```json
{
  "text": "これはペンです"
}
```

Slackで確認するといい感じに返ってきました！

GitHubに登録
```
git init
git touch .gitignore
echo ".vscode" >> .gitignore
echo ".clasp.json" >> .gitignore
echo "node_modules" >> .gitignore
git add -A
git commit -m "init commit"
git remote add origin git@github.com:[user]/[project].git
```

作ったソース
https://github.com/okdyy75/slack-tool
