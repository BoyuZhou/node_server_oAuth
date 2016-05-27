/**
 * Created by guzi on 2016/5/27.
 */
//错误处理
/*
* node错误处理的几种方式
* 1.同步try catch
* 2.回调事件第一个参数返回的是err对象
* 3.基于流的事件子类或者某些特殊事件可监听error事件
* 4.domain模块处理异步事件
* 5.process.on('uncatchException')事件的监听
*
* */

var express = require('express');
var app = express();
//同步try catch 无法捕获异步异常
try{

} catch (e) {

}

//domain 可嵌套domain 是一个EventEmmiter对象
//挡引入domain时，会从写nextTick（异步队列开始入队事件）和_tickCallback（出队事件）事件
//在出队入队转换时不断的创建domain对象包裹队列，接受error
//主要用于捕获代码bug及代码异常错误
var domain = require('domain');

app.use(function (req, res, next) {
    var d = domain.create();
    d.on('error', function (err) {
        try {
            var  killTimer = setTimeout(function () {
                process.exit(1);

            }, 3000);
            killTimer.unref();
            server.close();

            res.statusCode = 500;
            res.json({
                message: '服务器异常'
            });

        } catch (e) {
            console.log('error when exit', e.stack);
        }
        res.statusCode = 500;
        res.json({
            message: '服务器异常'
        });
        d.dispose();
    });

    d.add(req); //要将关键对象添加到domain中
    d.add(res);
    d.run(next); //监测方法用run
});

//
app.get('/', function (req, res, next) {

});

//process
process.on('uncatchException', function (err) {
   console.log(err);
    try {
       var  killTimer = setTimeout(function () {
           process.exit(1);

       }, 3000);
        killTimer.unref();
        server.close();

    } catch (e) {
       console.log('error when exit', e.stack); //stack为堆栈信息，查询这个代价比较大，建议一般不要访问
    }

});
