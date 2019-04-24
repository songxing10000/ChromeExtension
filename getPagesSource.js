
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
function translate(willTranslateStr, translatedStr, outTypeStr) {
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
        // return "/// " + willTranslateStr + "\n" + "@property (weak, nonatomic) IBOutlet UILabel *m_" + translatedStr + "Label;"
        return "/// " + willTranslateStr + "\n" + "@property (weak, nonatomic) IBOutlet KYLabelTextFieldView *m_" + translatedStr + "View;"
    }
    return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"
}


/// 通过 domcument 拼接相应 字符串
function DOMtoString(document_root) {
    var loadUrl = document.URL;
    if (loadUrl.endsWith('index.html') ||
        loadUrl.indexOf('index.html#artboard') >= 0) {
        // 有可能是美工的UI图 Sketch
        var str = document.documentElement.outerHTML;
        str = str.match(/SMApp\((.*)\) }\);/)[1];
        if (str.length > 50) {
            /// 转换成json
            var json = JSON.parse(str)
            var page;
            if (loadUrl.endsWith('index.html')) {
                page = json.artboards[0];
            } else if (loadUrl.indexOf('index.html#artboard') >= 0) {
                var idx = loadUrl.split('index.html#artboard')[1]
                page = json.artboards[idx];
            }
            var layers = page.layers;
            let resultss = layers.map(a => a.css);


            var outColor = new Set([]);
            var outFont = new Set([]);
            var outBorder = new Set([]);
            for (let results of resultss) {
                if ((typeof results) === 'undefined') {
                    continue;
                }
                for (let result of results) {
                    if (result.indexOf('border') >= 0) {
                        if (result.indexOf('border:') >= 0) {
                            /**
                             * border: 1px solid #2356FF;
                             * 转换
                             * border-width: 2px; borderStyle: solid; border-color:  #2356FF;
                             */
                            let arr = result.split(' ')
                            /// arr 为    ["border:", "1px", "solid", "#2356FF;"]
                            if (arr.length < 4) {
                                console.log(arr);
                            } else {
                                let bw = arr[1];
                                let bwValue = bw.replace('px', '') * 2;
                                let bwStr = '\tborder-width: ' + bwValue + 'px;\n'

                                let bs = arr[2];
                                let bsStr = '\tborderStyle: ' + bs + ';\n';

                                let bc = arr[3];
                                let bcStr = '\tborder-color:  ' + bc + '\n';
                                let borderC = bc.replace('#', '')
                                borderC = borderC.replace(';', '')
                                let weexStr = '\n.border' + borderC + ' {\n' + bwStr + bsStr + bcStr + '\n}';
                                outBorder.add(weexStr);
                            }
                        } else if (result.indexOf('border-radius:') >= 0) {
                            /**
                             * border-radius: 4px;
                             * 转换
                             * border-radius: 8px;
                             */

                        }

                    } else if (result.indexOf('#') >= 0) {
                        if (result.startsWith('background:')) {
                            let colorHex = result.match(/#(.*);/)[1];
                            let color = 'background-color: #' + colorHex;
                            let weexStr = '\n.bgc' + colorHex + ' {\n\t' + color + ';\n}';

                            outColor.add(weexStr);
                        } else if (result.startsWith('color:')) {

                            let colorHex = result.match(/color: #(.*);/)[1];
                            let weexStr = '\n.c' + colorHex + ' {\n\t' + result + '\n}';
                            outColor.add(weexStr);
                        } else {
                            /// background-image: linear-gradient(-132deg, #457FFF 2%, #49B2FC 100%);
                            console.log('非color或background-color: ' + result);
                            continue;
                        }
                    } else if (result.indexOf('font-size') >= 0) {
                        //// 抓取所有字号 font-size: 40px;
                        result = result.match(/font-size: (.*)px;/)[1];
                        let weexStr = '\n.f' + result + ' {\n' + '    font-size: ' + result * 2 + 'px;' + '\n}';
                        outFont.add(weexStr);
                    }
                }

            }

            return Array.from(outFont).join(' ') + '\n' +
                Array.from(outColor).join(' ') + '\n' +
                Array.from(outBorder).join(' ');
        } else {

        }
    } else if (loadUrl.indexOf('ult-yapi.che001.com') >= 0) {
        // document.getElementsByClassName('ant-table-row  ant-table-row-level-1')[0].innerText
        // document.getElementsByClassName('ant-table-row  ant-table-row-level-2')[0].innerText
        let arr1 = document.getElementsByClassName('ant-table-row  ant-table-row-level-1');
        let arr2 = document.getElementsByClassName('ant-table-row  ant-table-row-level-2');
        if (arr1.length <= 0 && arr2.length <= 0) {
            return '未找到数据 打开data这一层试'
        }
        let strOut = ''

        for (let index = 0; index < arr1.length; index++) {

            let str = arr1[index].innerText;

            let strs = str.split('\n');
            let propertyName = strs[0].split('\t')[0];
            let propertyType = strs[0].split('\t')[1] === 'string' ? 'NSString' : 'NSNumber';
            let propertyDes = strs[2];

            let copyOrStrong = propertyType === 'NSString' ? 'copy' : 'strong';
            let line = "/// " + propertyDes + "\n" + "@property (nonatomic, " +
                copyOrStrong + ') ' + propertyType + " *" + propertyName + ";\n"

            strOut += line;

        }
        for (let index = 0; index < arr2.length; index++) {

            let str = arr2[index].innerText;

            let strs = str.split('\n');
            let propertyName = strs[0].split('\t')[0];
            let propertyType = strs[0].split('\t')[1] === 'string' ? 'NSString' : 'NSNumber';
            let propertyDes = strs[2];

            let copyOrStrong = propertyType === 'NSString' ? 'copy' : 'strong';
            let line = "/// " + propertyDes + "\n" + "@property (nonatomic, " +
                copyOrStrong + ') ' + propertyType + " *" + propertyName + ";\n"

            strOut += line;

        }

        return strOut
    } else if (loadUrl.indexOf('weex.json') >= 0) {
        let text = document.childNodes[0].innerText
        return text
    } else if (loadUrl.indexOf('translate.google.cn') >= 0) {
        /// 考虑  's  Guarantor's vehicle information, guarantor's real estate information
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

                str += translate(willTranslate, translated, 'str') + '\n'
                label += translate(willTranslate, translated, 'label') + '\n'
            }
            return str + '\n' + label
        } else {
            // 一个单词 如，Daily trend chart
            let str = translate(willTranslateStr, translatedStr, 'str')
            let label = translate(willTranslateStr, translatedStr, 'label')
            return str + '\n' + '\n' + label

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
    } else if (loadUrl.indexOf('gateway-manager') >= 0) {
        // 头参数
        let headerStr = document.getElementsByClassName("ivu-table-tbody")[0].innerText;
        // Body参数
        let bodyStr = document.getElementsByClassName("ivu-table-tbody")[1].innerText;
        // if (arr1.length <= 0 && arr2.length <= 0) {
        //     return '未找到数据 打开data这一层试'
        // }
        let headerStrs = headerStr.split('\n')
        let bodyStrs = bodyStr.split('\n')
        // 参数名	
        let paramName = headerStrs[0]
        // 类型
        let paramType = headerStrs[2]
        // 参数说明
        let paramDes = headerStrs[8]
        // bodyStrs.forEach(function(value,index,array){
        //     if (index % 9 == 0) {
        //         console.log(array[index]);
        //     } else if (index % 2 == 0) {
        //         console.log(array[index]);
        //     } else if (index % 8 == 0) {
        //         // console.log("f", array[index]);
        //     }
        // })
        
        
        var strOut = ''+getReturnString("pro")
        strOut = '\n\n'+getReturnString("map")
        

        return strOut
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
/// 获取接口返回结果的字符串，type=pro为属性 type=map为map
function getReturnString(type) {
    let table = document.getElementsByClassName("zk-table__body zk-table--stripe")[0]
        var strOut = ''
        for (let row of table.rows) {
            let cells = row.cells
            for (let cellIdx = 0; cellIdx < cells.length; cellIdx++) {
                let name = cells[0].innerText
                var type = cells[1].innerText
                let mustFill = cells[2].innerText
                let defaultValue = cells[3].innerText
                let des = cells[4].innerText
                if (type === "string") {
                    type = "String?"
                } else if (type === "integer") {
                    type = "Int?"
                } else if (type === "number") {
                    type = "Int?"
                } else if (type === "object") {
                    type = "???"
                } else if (type === "array") {
                    type = "[String]?"
                }
                // type <- map["type"]
                if (des.length == 0) {
                    if (type == "pro") {
                        let line = "var " + name + ": " + type + "\n"
                        strOut += line
                    } else if (type == "map"){
                        let line = name+" <- map[\""+name+"\"]"
                        strOut += line
                    }
                    
                } else {
                    if (defaultValue.length == 0) {
                        if (type == "pro") {
                            let line = "///  "+des + "\nvar " + name + ": " + type+ "\n"
                            strOut += line
                        } else if (type == "map"){
                            let line = name+" <- map[\""+name+"\"]"
                            strOut += line
                        }
                        
                    } else {
                        if (type == "pro") {
                            let line = "///  "+des+", 默认值： "+defaultValue + "\nvar " + name + ": " + type+ "\n"
                            strOut += line
                        } else if (type == "map"){
                            let line = name+" <- map[\""+name+"\"]"
                            strOut += line
                        }
                        
                    }
                }
                
            }
            
        }
        return strOut
}