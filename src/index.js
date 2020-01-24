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
    return ContentService.createTextOutput('slack-tool v4')
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