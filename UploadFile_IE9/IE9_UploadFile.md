layui上传控件在ie9有兼容问题,上传请求后的回调`done:function(){}`会不执行。

**解决方案**
1. 用表单提交的方式`form.submit()`,点击`<input type='file'>`执行`onchange`事件。
2. 提交`form`时界面会跳转，所以把界面跳转指向`iFrame`，跳转的只是`iFrame`里面的内容，把`iFrame`隐藏掉，就像异步提交一样（实际上不是异步，是伪装的）。
3. 表单一但提交，服务器就会处理请求，处理完请求之后，就会把返回值放到`iframe`中,`iframe`加上`onload`事件，一旦这个事件触发，就表示服务端把你的请求处理完毕了。

**用表单提交的方式form.submit()**
1. 在IE9中不支持`formData`对象，无法使用`ajax`上传文件，所以通过在一个`form`表单中直接提交到服务器上传。
2. `enctype`是对`form`中数据进行什么编码，如果上传的文件的话，必须指定为**`multipart/form-data`**。
3. `target`是指定`form`表单的返回的页面在哪里打开，此处必须指定为`iframe`的名字即`targetIframe` 。
4. `input`中`change`表示 选择一个文件之后,触发某个方法 。
```
<form class="fileUploadFrom" id="" action="" encType="multipart/form-data" method="post" target="targetIframe">
	<button>上传图片</button>
	<input name="file" class="fileUpload" type="file">
</form>
<iframe name="targetIframe"  id="targetIframe" style="display: none;"></iframe>
```
注意： 
1. 上面主要是需要指定`form`的`target`属性与`iframe`的`name`一致，这样提交表单后不会刷新页面，并且在`iframe`的`body`中可以拿到返回的数据。
2. 在IE9中如果返回的是`json`格式的数据不会被解析，这时会弹出提示框是否要下载。解决方法是后台修改`response`的`content-type`为`text/plain`或`text/html`。

js:
```
$(".fileUpload").change( function () {
   if ($(this).val()) {
    	$('fileUploadFrom').submit()
        // 如果之前选择了一个文件没有清空，那么onchange事件不会触发，所以这里需要在适当的地方对文件清空. 
        // form.reset() //提交完进行重置form表单

        // iframe onload 事件, 上传后自动执行
        $('iframe[name="targetIframe"]').on('load', function () {
            var json =  $(window.frames["targetIframe"].document).find("body");
            if(json.html()) {
                var res = JSON.parse(json.html().toString())
                // 返回结果 res
            }
        })
	}
})
```

css:
```
.fileUploadFrom'{
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'middle'
}
.fileUploadFrom input' {
    position: 'absolute',
    right: '0px',
    top: '0px',
    opacity: '0',
    '-ms-filter': 'alpha(opacity=0)',
    fontSize: '200px',
}
```

判断IE版本:
```
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
```