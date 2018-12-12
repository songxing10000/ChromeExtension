
/**
 *  document.getElementById('merge_request_title')
    document.getElementById('merge_request_description')
    document.getElementsByClassName('commit-row-message')
    document.getElementsByClassName('commit-row-message')[2].innerText
    document.getElementsByClassName('commit-row-message')[1].innerText
    document.getElementsByClassName('commit-row-message')[0].innerText
    "Merge branch 'master' of "
 * 
 * */
//定义一个比较器
function compare(propertyName) {
    return function (object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
            return 1;
        } else if (value2 > value1) {
            return -1;
        } else {
            return 0;
        }
    }
}
/// 处理一个单词 ，str 定义自符串，label 定义连线label
function translate(willTranslateStr, translatedStr,outTypeStr) {
    // 一个单词 如，Daily trend chart
    let array = translatedStr.split(' ')
    if (array.length === 1) {
        /// 如 曾经  被翻译 成 once
        translatedStr = array[0]
        /// 再来一次首字母小写
        translatedStr = translatedStr.charAt(0).toLowerCase() + translatedStr.slice(1);
    } else {
        let str = ''
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (index == 0) {
                // 首字母小写
                str += element.charAt(0).toLowerCase() + element.slice(1);
            } else {
                // 首字母大写
                str += element.charAt(0).toUpperCase() + element.slice(1);
            }
        }
        /// 再来一次首字母小写
        translatedStr = str.charAt(0).toLowerCase() + str.slice(1);
    }
    if (outTypeStr === 'str') {
        return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"
    } else if (outTypeStr === 'label') {
        return "/// " + willTranslateStr + "\n" + "@property (weak, nonatomic) IBOutlet UILabel *m_" + translatedStr + "Label;"
    }
    return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"
}


/// 通过 domcument 拼接相应 字符串
function DOMtoString(document_root) {
    var loadUrl = document.URL;

    if (loadUrl.indexOf('weex.json') >= 0) {
        let text = document.childNodes[0].innerText
        return text
    } else  if (loadUrl.indexOf('translate.google.cn') >= 0) {
        /// 谷歌翻译处理
        /// 待翻译的字符串
        var willTranslateStr = document.getElementsByClassName('text-dummy')[0].innerHTML;
        /// 翻译后的字符串 ,如  Daily trend chart
        var translatedStr = document.getElementsByClassName('tlid-translation translation')[0].innerText;
        if (willTranslateStr.indexOf("、") >= 0) {
            // 多个单词 如，Daily trend chart, monthly trend chart
            let willTranslateArray = willTranslateStr.split("、")
            let translatedArray = translatedStr.split(",")
            let str = ''
            let label = ''
            for (let index = 0; index < translatedArray.length; index++) {
                const willTranslate = willTranslateArray[index];
                const translated = translatedArray[index];
                
                str += translate(willTranslate,translated,'str') + '\n'
                label += translate(willTranslate,translated,'label') + '\n'
            }
            return str + '\n' + label
        } else {
            // 一个单词 如，Daily trend chart
            let str = translate(willTranslateStr,translatedStr, 'str')
            let label =  translate(willTranslateStr,translatedStr, 'label')
            return  str + '\n' + '\n' + label
            
        }

        /// 日趋势图
        return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"

    } else if (loadUrl.indexOf('http://tool.chinaz.com/dns?') >= 0) {
        /// host dns 处理
        var cells = document.getElementsByClassName('ReListCent ReLists bor-b1s clearfix')
        var cellIdx;
        var outArra = []
        for (cellIdx = 0; cellIdx < cells.length; cellIdx++) {
            var cell = cells[cellIdx];
            var cellStrs = cell.innerText.split('\n');
            if (cellStrs.length === 6) {

                var ipStr = cellStrs[1].split(' ')[0];
                var sslTimeStr = cellStrs[3];


                if (sslTimeStr.length < 3 && outArra.length < 5) {
                    outArra.push({ 'ip': ipStr, 'ssl': sslTimeStr })
                }
            } else if (cellStrs.length > 6) {

                var idx;
                var ips = [];
                var ssls = [];
                for (idx = 1; idx < cellStrs.length; idx++) {
                    var idxStr = cellStrs[idx];

                    /*
                    ["OpenDNS[海外]", "151.101.1.194 [美国 Fastly公司CDN网络节点]", "", "151.101.65.194 [美国 Fastly公司CDN网络节点]", "", "151.101.129.194 [美国 Fastly公司CDN网络节点]", "", "151.101.193.194 [美国 Fastly公司CDN网络节点]", "", "30", "", "30", "", "30", "", "30", "", ""]
                    */
                    if (idxStr.length > 8) {
                        ips.push(idxStr.split(' ')[0])
                    } else if (idxStr.length >= 1) {
                        ssls.push(idxStr)
                    }
                }

                var outIdx;
                for (outIdx = 0; outIdx < ips.length; outIdx++) {
                    var ip = ips[outIdx];
                    var sslStr = ssls[outIdx];
                    if (sslStr.length < 3 && outArra.length < 5) {
                        outArra.push({ 'ip': ip, 'ssl': sslStr })
                    }
                }
            } else if (cellStrs.length < 6) {
            }
        }



        var arr = outArra.sort(compare('ssl'));

        var outStr = '';

        for (k = 0; k < arr.length; k++) {
            var dict = arr[k];

            if (dict.hasOwnProperty('ip') && dict.hasOwnProperty('ssl')) {

                var ip = dict['ip'];
                var ssl = dict['ssl'];
                var url = document.getElementsByClassName('search-write-cont w360 WrapHid')[0].value;
                var ipLine = '\n' + ip + ' ' + ssl
                if (url) {
                    ipLine = '\n' + ip + ' ' + url
                }
                if (outStr.indexOf(ip) === -1) {

                    outStr += ipLine
                }


            }

        }

        return outStr;
    } else if (loadUrl.indexOf('/merge_requests/new') >= 0) {
        /// 提交代码时 ，自动抓提交记录文字
        var msgs = document.getElementsByClassName('commit-row-message');

        var msgStrs = []
        for (i = 0; i < msgs.length; i++) {
            var msgStr = document.getElementsByClassName('commit-row-message')[i].innerText;
            if (msgStr != 'Merge branch \'master\' of ') {
                msgStrs.push(msgStr)
            }
        }
        var des = msgStrs.join('、')
        document.getElementById('merge_request_title').innerText = des;
        document.getElementById('merge_request_description').innerText = des;
        document.getElementById('merge_request_title').value = des;
        document.getElementById('merge_request_description').value = des;
        return ''
    }
    /// 根据网页抓取property

    var outstr = '';
    var tables = document.getElementsByTagName('table');
    /// 请求路径	{base_url}/credit/personal/contactdetail/{ssoId}
    var url = document.getElementsByTagName("table")[0].rows[3].innerText
    url = url.split('{base_url}/')[1]
    var api = url;
    if (url.indexOf('{') != -1) {
        var api = url.split('{')[0]
    }
    // credit/personal/updatebankcard
    url = url.replace(/\//g, '_')
    // credit_personal_getstatus_{ssoId}_{businessId}
    url = url.split('{')[0]
    // credit_personal_getstatus_
    if (url.charAt(url.length - 1) === '_') {

        url = url.substr(0, url.length - 1);
    }
    url = url + ' ' + api + '\n';


    outstr += url;

    var inputParamsStr = '\n// 入参:\n';
    var inputTableRows = document.getElementsByTagName("table")[2].rows;
    if (inputTableRows.length > 2) {
        var i;
        for (i = 0; i < inputTableRows.length; i++) {


            if (i >= 2) {
                var str = inputTableRows[i].innerText;

                if (str.indexOf('\n')) {
                    var str = str.split('\n')[0] + '	' + str.split('\n')[2];
                }
                // String	是	 2042103002281206425	查询的用户ssoid
                var strs = str.split('	');
                var name = strs[0]
                var typeStr = strs[1];
                var demo = strs[3];
                var des = strs[4];
                demo = (demo.length > 1) ? (',如  ' + demo) : '';
                if (typeStr === 'Int' || typeStr === 'int') {
                    inputParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSNumber *' + name + ';';
                } else if (typeStr === 'String' || typeStr === 'string') {
                    inputParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, copy) NSString *' + name + ';';
                } else if (typeStr === 'Arr' || typeStr === 'arr' || typeStr === 'Array' || typeStr === 'array') {
                    if (name === 'attachments') {
                        inputParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray<KYUploadImage *> *' + name + ';';

                    } else {

                        inputParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray *' + name + ';';
                    }

                }
            }

        }
    }

    var outParamsStr = '\n\n// 出参:\n';
    var outTableRows;
    if (document.getElementsByTagName("table")[3].rows.length == 1) {
        outTableRows = document.getElementsByTagName("table")[4].rows;
    } else {
        outTableRows = document.getElementsByTagName("table")[3].rows;
    }
    // 取table的列数
    if (outTableRows.item(0).cells.length == 8) {

        if (outTableRows.length > 5) {
            var j;

            for (j = 0; j < outTableRows.length; j++) {


                if (j >= 5) {

                    var str = outTableRows[j].innerText;

                    if (str.indexOf('\n')) {
                        var str = str.split('\n')[0] + '	' + str.split('\n')[2];
                    }
                    // String	是	 2042103002281206425	查询的用户ssoid
                    var strs = str.split('	');
                    var name = strs[0]
                    var typeStr = strs[1];
                    var demo = strs[7];
                    var des = strs[6];

                    demo = (demo.length > 1) ? (',如  ' + demo) : '';
                    if (typeStr === 'Int' || typeStr === 'int') {
                        outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSNumber *' + name + ';';
                    } else if (typeStr === 'String' || typeStr === 'string') {
                        outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, copy) NSString *' + name + ';';
                    } else if (typeStr === 'Arr' || typeStr === 'arr' || typeStr === 'Array' || typeStr === 'array') {
                        if (name === 'attachments') {
                            outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray<KYUploadImage *> *' + name + ';';

                        } else {

                            outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray *' + name + ';';
                        }

                    }
                }

            }
        }
    } else {

        if (outTableRows.length > 5) {
            var j;

            for (j = 0; j < outTableRows.length; j++) {

                if (j >= 5) {

                    alert('name2')
                    var str = outTableRows[j].innerText;

                    if (str.indexOf('\n')) {
                        var str = str.split('\n')[0] + '	' + str.split('\n')[2];
                    }

                    // String	是	 2042103002281206425	查询的用户ssoid
                    var strs = str.split('	');
                    var name = strs[0]
                    var typeStr = strs[1];
                    var demo = strs[3];
                    var des = strs[4];
                    demo = (demo.length > 1) ? (',如  ' + demo) : '';

                    if (typeStr === 'Int' || typeStr === 'int') {
                        outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSNumber *' + name + ';';
                    } else if (typeStr === 'String' || typeStr === 'string') {
                        outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, copy) NSString *' + name + ';';
                    } else if (typeStr === 'Arr' || typeStr === 'arr' || typeStr === 'Array' || typeStr === 'array') {

                        if (name === 'attachments') {
                            outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray<KYUploadImage *> *' + name + ';';

                        } else {

                            outParamsStr += '\n' + '/// ' + des + demo + '\n' + '@property(nonatomic, strong) NSArray *' + name + ';';
                        }

                    }
                }

            }
        }
    }



    outstr += inputParamsStr;
    outstr += outParamsStr;
    return outstr;
}

// 注入脚本时，自动发送消息getSource，调用DOMtoString方法给返回值
chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});