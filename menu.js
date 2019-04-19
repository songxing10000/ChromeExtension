
function genericOnClick(info, tab) {
    alert(info.linkUrl+"ff");
}
function selectionOnClick(info, tab) {
    // 造中的文字   #333333 100%
    let selectedStr =  info.selectionText

    alert(selectedStr);
}
// 这里是对选中一个是链接的进行相关处理，目前，只想选中十六进制色，转换成swift的代码而已，暂不对链接进行处理，后续有可能会，保留代码
// var link = chrome.contextMenus.create({ "title": "链接地址", "contexts": ["link"], "onclick": genericOnClick });
var selection = chrome.contextMenus.create({ "title": "swift-Color", "contexts": ["selection"], "onclick": selectionOnClick });