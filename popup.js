var title;
var url;

// 监听来消息 getSource
chrome.runtime.onMessage.addListener(function (request, sender) {
  message.innerText = 'dfd'
  if (request.action == "getSource") {
    if (url.indexOf('http://tool.chinaz.com/dns?') >= 0) {
      message.innerText = '\n' +  request.source;
    } else if (url.indexOf('/merge_requests/new') >= 0) {

    }else if (url.indexOf('translate.google.cn') >= 0) {
      message.innerText = request.source;
    } else {
      // popup.js 回显示 网页里 信息。
      message.innerText = '/// ' + title + url + '\n' + '#define ' + request.source;
    }

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

}
// 窗口载入时使用自己的载入函数
window.onload = onWindowLoad;