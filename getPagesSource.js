
/**
 * 只把首字母进行大写，其余字字符串不改变之前的大小写样式
 * @param {string} str 
 */
function upperCaseFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);

}
/**
 * 只把首字母进行小写，其余字字符串不改变之前的大小写样式
 * @param {string} str 
 */
function lowerCaseFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);

}
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
        translatedStr = lowerCaseFirstLetter(translatedStr)
    } else {
        let str = ''
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (index == 0) {
                // 首字母小写
                str += lowerCaseFirstLetter(element)
            } else {
                // 首字母大写
                str += upperCaseFirstLetter(element)
            }
        }
        /// 再来一次首字母小写
        translatedStr = lowerCaseFirstLetter(str);
    }
    if (outTypeStr === 'str') {
        return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"
    } else if (outTypeStr === 'label') {
        // return "/// " + willTranslateStr + "\n" + "@property (weak, nonatomic) IBOutlet UILabel *m_" + translatedStr + "Label;"
        return "/// " + willTranslateStr + "\n" + "@property (nonatomic, weak) UIButton *m_" + translatedStr + "Btn;"
    } else if (outTypeStr === 'label-sw') {
        let controlName = upperCaseFirstLetter(translatedStr)
        // return "/// " + willTranslateStr + "\n" + "@property (weak, nonatomic) IBOutlet UILabel *m_" + translatedStr + "Label;"
        return "\n/// " + willTranslateStr + "\n" + "var m_" + translatedStr + "Label: UILabel!"+
        "\n/// " + willTranslateStr + "\n" + "@IBOutlet weak var m_" + translatedStr + "Label: UILabel!"+
        "\n/// " + willTranslateStr + "\n" + "var m_" + translatedStr + "Btn: UIButton!"+
        "\n/// " + willTranslateStr + "\n" + "@IBOutlet weak var m_" + translatedStr + "Btn: UIButton!"+
        
        "\n\nm_"+ translatedStr + "Btn.addTarget(self, action: #selector(on"+controlName+"BtnClick(btn:)), for: .touchUpInside)"+
        "\n// MARK: - "+ willTranslateStr +" 按钮事件"+
        "\n/// "+ willTranslateStr +" 按钮事件"+
        "\nfunc on"+controlName+"BtnClick(btn: UIButton) {"+
        "\n\n"+
        "}"
    }
    return "/// " + willTranslateStr + "\n" + "NSString *" + translatedStr + "Str" + " = @\"" + willTranslateStr + "\";"
}


/// 通过 domcument 拼接相应 字符串
function DOMtoString(document_root) {
    var loadUrl = document.URL;
    if (loadUrl.endsWith('index.html') ||
        loadUrl.indexOf('index.html#artboard') >= 0 ||
        loadUrl.indexOf('#artboard') >= 0) {
        // 有可能是美工的UI图 Sketch
        var str = document.documentElement.outerHTML;
        str = str.match(/SMApp\((.*)\) }\);/)[1];
        if (str.length > 50) {
            /// 转换成json
            var json = JSON.parse(str)
            var page;
            if (loadUrl.endsWith('index.html')) {
                page = json.artboards[0];
            } else if (loadUrl.indexOf('#artboard') >= 0) {
                var idx = loadUrl.split('#artboard')[1]
                page = json.artboards[idx];
            } else if (loadUrl.indexOf('index.html#artboard') >= 0) {
                var idx = loadUrl.split('index.html#artboard')[1]
                page = json.artboards[idx];
            }

            var layers =  page.layers
            

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
    } 
    else if (loadUrl.includes('91hiwork')) {
        let tabUrl = document.URL
        // 接口名称 获得推荐商品和课程
        let apiCNName = document.getElementsByClassName('ant-col-8 colName')[0].innerText;
        // POST
        let apiMethod = document.getElementsByClassName('colValue tag-method')[0].innerText;
        // /api/shortvideo/getproductandcourse
        let api = document.getElementsByClassName('colValue')[3].innerText;
        let apiStr = api.substr(0, 1) ===   '/' ? api.slice(1) : api;
        let apiMethodStr = apiMethod === 'POST' ? "HttpRequestTypePost" : "HttpRequestTypeGet";
        let strOut =
            `/// ${apiCNName} ${tabUrl}
            +(void)getRecommendedGoodsAndCoursesVideoid:(NSString *)videoid tagid:(NSString *)tagid failure:(void (^)(NSError *))failure success:(void (^)(id))success {
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0NSDictionary *dict = @{ };
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0[HttpRequest request:@"${apiStr}"
                          parameters:dict
                                type:${apiMethodStr}
                         companytype:HttpRequestCompanyTypeHilife
                             success:success
                             failure:failure];
            }`;
        return strOut
    }
    else if (loadUrl.indexOf('gateway-manager') >= 0) {
        /*
      // MARK: 编辑部门 http://ult-gateway-manager.qyd.com/#/serviceManage/preview/827
    /// 编辑部门 http://ult-gateway-manager.qyd.com/#/serviceManage/preview/827

    let postEditDepartment = TSNetworkRequestMethod(method: .post, path: "enterprise/department/basic/modify", replace: "")
      */
        let tabUrl = document.URL
        let apiName = document.getElementsByClassName("ivu-col ivu-col-span-12")[0].innerText.replace("接口名称：\n","")
        let desStr =  "// MARK: "+apiName+ "\n/// " +apiName+" "+tabUrl
        /**
         * 请求方式 get post
         */           
        let methodTypeStr = document.getElementsByClassName("ivu-tag-text ivu-tag-color-white")[0].innerText
        let apiURLStr = document.getElementsByClassName("ivu-col ivu-col-span-18")[0].innerText
        // /enterprise/manage/list这样写获取不到操作类型，如edit delete save get 等
        /**
         * 操作类型 如 enterprise/announcement/employee/get 中的get
         */
        var actionStr = ''
        // 考虑没有  /enterprise/ 咋办
        let firstKeyStr = "/enterprise/"
        let secondKeyStr = "/api/v3/"
        var findKeyStr = ''
        if (apiURLStr.includes(firstKeyStr)) {
            findKeyStr = firstKeyStr
        } else if (apiURLStr.includes(secondKeyStr)) {
            findKeyStr = secondKeyStr
        } else {
            console.error("url异常情况！！！");
            
        }
        var sps = apiURLStr.split(findKeyStr)[1].split("/")
        if (sps.length >= 3) {
            actionStr = apiURLStr.split(findKeyStr)[1].split("/")[2]
            actionStr = upperCaseFirstLetter(actionStr);
            
        }

        var actionDesStr = apiURLStr.split(findKeyStr)[1].split("/")[0]
        actionDesStr = upperCaseFirstLetter(actionDesStr);
        // getManage 这种太短了，再获取后面的
        if (actionDesStr.length <= 9) {
            var actionDesStr2 = apiURLStr.split(findKeyStr)[1].split("/")[1]
            actionDesStr = upperCaseFirstLetter(actionDesStr2);
        }
        // js 字符串 拼接 插入多个空格   \xa0\xa0\xa0\xa0\xa0\xa0\xa0
        console.log('zz'+actionDesStr);
        let reqStr = "\nlet "+methodTypeStr+actionStr+actionDesStr+" = TSNetworkRequestMethod(method: ."+methodTypeStr+
        ", path: \""+apiURLStr.split(".com/")[1]+"\", replace: nil)\n"

        var baseModelStr = 
        '\nimport ObjectMapper\n\n' +
        'class KY???ResModel: KYBaseModel {\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0var data : KY???DataModel?\n\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0required init?(map: Map) {\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0super.init(map: map)\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0}\n\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0override func mapping(map: Map) {\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0super.mapping(map: map)\n\n'+       
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0data <- map["data"]\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0}\n'+
        '}\n\nclass KY???DataModel: Mappable {\n'
        let strOut = baseModelStr + '\n' + getReturnString("pro")
        let secModelStr = 
        '\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0required init?(map: Map) { }\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0init() {\n\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0}\n'+
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0func mapping(map: Map) {\n'
        let strOut2 = '\n\n' + getReturnString("map")
        let srtOut3 = "\n\n" + getParaString() + "\n\n"
        // 这里得分开写，不然只能出来一个，坑
        return desStr +reqStr+srtOut3 + strOut + secModelStr + strOut2 +'\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0}\n}'
    } 
    /// 根据网页抓取property
    var df = document.querySelector("body > div > div > div.col-xs-16.col-xs-offset-8.main > div.search-content > ul");
for (const dff in df) {
    console.log(df.length);
}


return 'ff';
    var outstr = '';
    var tables = document.getElementsByTagName('table');
    /// 请求路径	{base_url}/credit/personal/contactdetail/{ssoId}
    var url = document.getElementsByTagName("table")[0].rows[3].innerText;
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
function getParaString() {
    if (document.getElementsByClassName("ivu-table-body").length < 1) {
        console.error("没有找到参数信息");
        return ""
    }

    // 入参
    let table = document.getElementsByClassName("ivu-table-body")[0].getElementsByTagName("table")[0]
    if (document.getElementsByClassName("ivu-table-body").length > 1) {
        /// 第二个目前场景大多数是Authorization
        table = document.getElementsByClassName("ivu-table-body")[0].getElementsByTagName("table")[0]
        // 很多时候， 有些人写接口文档不规范，一会在第一个，一会儿在第二
        let row0Str = table.rows[0].cells[0].innerText
        if (row0Str == 'Authorization') {
            table = document.getElementsByClassName("ivu-table-body")[1].getElementsByTagName("table")[0]
        }
    }
    let strOut = '///\n/// - Parameters:\n'
    for (let row of table.rows) {
        let cells = row.cells
        let name = cells[0].innerText
        var type = cells[1].innerText
        /// 是
        let mustFill = cells[2].innerText
        /// 示例值
        let exampleValue = cells[3].innerText
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
        if (mustFill === "是") {
            type = type.replace("?", "")
        }
        
// ///   - name: 部门名称
                    let line = "/// \xa0\xa0\xa0\xa0\xa0\xa0\xa0- "  + name + ": " + des + "\n"
                    strOut += line
         

    }
    return strOut

}
/// 获取接口返回结果的字符串，actionType=pro为属性 actionType=map为map
function getReturnString(actionType) {
    


    /// 返回数据
    let table = document.getElementsByClassName("zk-table__body zk-table--stripe")[0]
    let strOut = ''

    for (let row of table.rows) {
        let cells = row.cells
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

        if (des.length == 0) {

            if (actionType == "pro") {
                let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0检测到三级元素，得自己手动复现为另外一个moddel\n'
                if (name.length > 0) {
                    line = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0var " + name + ": " + type + "\n"
                }
                strOut += line

            } else if (actionType == "map") {
                let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0检测到三级元素，得自己手动复现为另外一个moddel\n'
                if (name.length > 0) {
                    line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + name + " <- map[\"" + name + "\"]\n"
                }
                strOut += line

            }

        } else {


            if (defaultValue.length == 0) {
                if (actionType == "pro") {
                    let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0检测到三级元素，得自己手动复现为另外一个moddel\n'
                    if (name.length > 0) {
                        line = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0///  " + des + "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0var " + name + ": " + type + "\n"
                    }
                    strOut += line
                } else if (actionType == "map") {

                    let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + name + " <- map[\"" + name + "\"]\n"
                    strOut += line
                }

            } else {
                if (actionType == "map") {
                    let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + name + " <- map[\"" + name + "\"]\n"
                    strOut += line
                } else {
                    let line = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0检测到三级元素，得自己手动复现为另外一个moddel\n'
                    if (name.length > 0) {
                        line = "\xa0\xa0\xa0\xa0\xa0\xa0\xa0///  " + des + "\n\xa0\xa0\xa0\xa0\xa0\xa0\xa0var " + name + ": " + type + "\n"
                    }
                    strOut += line
                }

            }
        }

    }
    
    return strOut
}