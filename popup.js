var title;
var url;

// 监听来消息 getSource
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
      message.innerText = request.source;
  }
});

function onWindowLoad() {

  // 获取 popup.html里的元素进行字符串设定
  var message = document.querySelector('#message');
  // 获取 当前选择的tab的title 和 url
  chrome.tabs.getSelected(null, function (tab) {//获取当前tab
    title = tab.title;
    url = tab.url;
  });
  // 注入脚本，接收错误回显
  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

  // 复制代码事件
  document.getElementById('copyCode').addEventListener('click', function () {
  
    
    let codeStr = document.getElementById('message').innerText;
    copyStr(codeStr)
  
  });

}
// 窗口载入时使用自己的载入函数
window.onload = onWindowLoad;


/// 复制字符串到粘贴板
function copyStr(str) {
  // 复制字符串到粘贴板 http://www.voidcn.com/article/p-effxpdwn-buc.html
  var input = document.createElement('textarea');
  document.body.appendChild(input);
  
  input.value = str;

  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}