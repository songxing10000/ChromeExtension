var title;
var url;

// 监听来消息 getSource
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    if (url.indexOf('http://tool.chinaz.com/dns?') >= 0) {
      message.innerText = '\n' + request.source;
    } else if (url.indexOf('/merge_requests/new') >= 0) {

    } else if (url.indexOf('translate.google.cn') >= 0) {
      message.innerText = request.source;
    } else if (url.indexOf('gateway-manager') >= 0) {
      
      message.innerText = request.source;

  } else if (url.indexOf('weex.json') >= 0) {
      if (request.source.indexOf('{"page') >= 0) {
        message.innerText = 'decrypted'
        return;
      }
      // popup.js 回显示 网页里 信息。
      let key = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDkAh06uqqrA8qIsyd98'
      let iv = 'kWeUizGkPbW2AKR7bXK3W71l7U7VN/+1ohd0kuFLbnjTCbp8nTJUQIDAQAB'
      var keyHex = CryptoJS.enc.Utf8.parse(key);
      var ivHex = CryptoJS.enc.Utf8.parse(iv);
      // Triple DES 解密
      var decrypted = CryptoJS.TripleDES.decrypt(request.source, keyHex, {
        iv: ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // 转换为 utf8 字符串
      decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
                code: 'document.childNodes[0].innerText = ' + JSON.stringify(decrypted.toString())
            }, function () {
              if (chrome.runtime.lastError) {
                message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
              } else {
                message.innerText = 'decrypted'
              }
            })
        })
      // message.innerText = '/// ' + title + url + '\n' + '#define ' + request.source;
    } else  {
      message.innerText = request.source;
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