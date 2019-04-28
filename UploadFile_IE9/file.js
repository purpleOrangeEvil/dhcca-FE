// 判断ie版本
function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if(fIEVersion == 7) {
            return 7;
        } else if(fIEVersion == 8) {
            return 8;
        } else if(fIEVersion == 9) {
            return 9;
        } else if(fIEVersion == 10) {
            return 10;
        } else {
            return 6;//IE版本<=7
        }
    } else if(isEdge) {
        return 'edge';//edge
    } else if(isIE11) {
        return 11; //IE11
    }else{
        return -1;//不是ie浏览器
    }
}

// 存储回调函数
var fn={};
var attributes = '';

// 判断在ie9下 那些上传控件需要替换  如果是ie9, 如果所传值组件存在 ,循环替换
function judgeUploadFile(obj) {
    if(IEVersion() === 9) {
        if($(obj.ele).length !== 0){
            $(obj.ele).each(function (index) {
                var fid = index + 1;
                var parameter = {
                    ele: $(this),
                    fid: obj.mark + fid, // index 从1开始
                    fBtnClass: obj.fBtnClass, // 上传按钮的样式
                    Faction: obj.fAtion // action
                }
                // 用对象存储回调函数 使用from的id做属性名
                attributes = 'fileUploadIE'+ obj.mark + fid
                fn[attributes] = obj.fn
                // 循环替换
                handleUploadComponent(parameter)
            })
        }
    }
}

// 循环替换上传组件
function handleUploadComponent(obj) {
    var str = ''

    // 上传参数
    if(obj.fileObj){
        for (var item in obj.fileObj) {
            if(obj.fileObj.hasOwnProperty(item)) {
                str += '<input type="hidden" name="'+ item +'" value="'+ obj.fileObj[item] +'">'
            }
        }
    }
    // 上传按钮的样式
    var fileUploadBtn = obj.fBtnClass ? obj.fBtnClass: 'fileUploadBtn';
    var layurl = obj.ele.attr('lay-data')
    if(layurl ){
        var index = layurl.lastIndexOf('=')
        obj.Faction += index !== -1 ? layurl.substring(index + 1).replace("'}","") : ''
    }

    // 添加新的上传按钮
    obj.ele.after('<form id="fileUploadIE'+ obj.fid +'" method="post" action="'+ obj.Faction +'" encType="multipart/form-data" target="targetIframe" class="fileinput-button">' +
        '<button class="'+ fileUploadBtn + '" >' + obj.ele.html() +'</button>' +
        '<input class="fileUpload" type="file"   name="file"> ' +
        str + '</form> ' +
        '');

    // 正常提交表单后会跳转页面，有时候不希望跳转，则需要用一个隐藏的iframe来接受表单提交的结果
    if($('body').find('iframe[name="targetIframe"]').length === 0){
        $('body').append('<iframe name="targetIframe" id="targetIframe" style="display: none;"></iframe>')
    }

    // 删除不好使的按钮
    obj.ele.remove()

    // 样式
    $('.fileinput-button').css({
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        verticalAlign: 'middle'
    })
    $('.fileinput-button input').css({
        position: 'absolute',
        right: '0px',
        top: '0px',
        opacity: '0',
        '-ms-filter': 'alpha(opacity=0)',
        fontSize: '200px',
    })
}


// 上传 触发change事件 如果input=file有值 则提交form
$("body").delegate(".fileUpload", "change", function () {
    if ($(this).val()) {
        var ffrom = $(this).parent()
        ffrom.submit();
        // 取得id 也就是回调函数的属性名
        attributes = ffrom.attr('id')

        // iframe onload 事件, 上传后自动执行
        $('iframe[name="targetIframe"]').on('load', function () {
            var json =  $(window.frames["targetIframe"].document).find("body");
            if(json.html()) {
                var res = JSON.parse(json.html().toString())
                fn[attributes](res)
                layer.msg(res.info);
            }
        })
    }
})

