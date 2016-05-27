/**
 * Created by guzi on 2016/5/26.
 */
var mysql = require('mysql');
//创建一个connection
//options
// host 主机地址
// user 用户名
// password
// port
//database 数据库名
//charset 连接字符集（默认‘UTF8_GENERAL_CI' 要求大写）
//localAddress 用于TCP连接的IP
//scoketPath 连接到unix路径，有host和port时会忽略
//timezone 时区
//connectTimeout 连接超时
//stringifyObjects 是否序列化对象，默认false
//typeCast 是否将值转化为本地javascript类型(默认true)
//queryFormat 自定义query语句格式化方法
//supportBigNumbers 数据库支持bigint或者decimal类型需设为true
//bigNumberStrings  强制bigint或decimal列以javascript字符串类型返回
//debug 开启调试
//mulitipleStatements 是否允许一个query有多个MySQL语句
//flags 用于修改连接标志
//ssl 使用ssl参数（与crypto.createCredenitals参数格式一至）或一个包含ssl配置文件名称的字符串，目前只捆绑Amazon RDS的配置文件


var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    port: '3306'
});
//创建一个connection
connection.connect(function (err) {
    if (err) {
        console.log('[query] - :' + err);
        return;
    }
    console.log('[connection connect] successd!');
});

//执行SQL语句
connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) {console.log('[query] - :'+err);
    return;
    }
    console.log('The solution is: ',rows[0].solution);
});

//关闭connection
connection.end(function (err) {
    if (err) return;
    console.log('[connection end] successed!');
});

//增
connection.connect();
var userAddSql = 'INSERT INTO userinfo(Id, UserName,UserPass) VALUES(0,?,?)';
var userAddSql_Params = ['Wilson', '123'];

connection.query(userAddSql, userAddSql_Params, function (err, ret) {
    if (err) {
        console.log('[INSERT ERROR] - ',err.message);
        return;
    }

    console.log('++++++++++++++++++++++');
    console.log('INSERT',ret);
    console.log('+++++++++++++++++++++++');
});

connection.end();

//改
var userModSql = 'UPDATE userinfo SET UserName = ?, UserPass = ? WHERE Id = ?';
var userModSql_Params = ['haha', '456', 1];

connection.query(userAddSql, userAddSql_Params, function (err, ret) {
    if (err) {
        console.log('[UPDATE ERROR] - ',err.message);
        return;
    }
    console.log('-------------------');
    console.log('UPDATE AFFECTEDROWS',ret.affectedRows);
    console.log('-------------------');
});

//查
var userGetSql = 'SELECT * FROM userinfo';

connection.query(userGetSql, function (err, ret) {

});

//删
var userDelSql = 'DELETE FROM userinfo';
connection.query(userDelSql, function (err, ret) {

});

//connection.end()//等query语句执行完
//connection.destory()//直接终止连接

//waitForConnections 当连接池没有连接或超出最大限制时，设置为true且会把连接放入队列，设置为false会返回error
//connectionLimit 连接数限制，默认10
//queueLimit 最大请求队列限制 默认0（不限制）
//建立连接池
var pool = mysql.createPool({
    host: '127.0.0.2',
    user: 'root',
    password: '123'
});
//*在连接使用之前，创建session会话
pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment = 1');
});

//*连接池发出队列事件，当一个回调函数在等待连接
pool.on('enqueue', function () {
    console.log('等待可用的链接');
});

//停止所有连接
pool.end();

//直接使用
pool.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) console.error(err);

    console.log('The solution is: ',rows[0].solution);

});

//共享
pool.getConnection(function (err, connection) {
    connection.query('', function () {
        connection.release();
    });
});

var db_config={};
//断线重连
function handleDisconnect () {
    connection = mysql.createConnection(db_config);
    connection.connect(function (err) {
        if (err) {
           console.log('进行断线重连'+new Date());
            setTimeout(handleDisconnect, 2000);
            return;
        }
        console.log('连接成功');
    });
    connection.on('error', function (err) {
        console.log('db error',err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

//防止SQL注入，使用mysql.escape(), connection.escape() or pool.escape()
//使用问号？写法，可以不用转译
var userId = 1;
var columns = ['username', 'email'];
var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function(err, results) {
    // ...
});


//使用自定义规则
connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};

connection.query("UPDATE posts SET title = :title", { title: "Hello MySQL" });



//连接集群

var config={
    canRetry: true, //默认true，是否自动重连
    removeNodeErrorCount: 5, //默认为5，当节点的错误次数超过这个值，消除这个节点
    restoreNodeTimeout: 200, //如果连接失败，在另一个连接尝试链接前指定毫秒数，如果是0，直接删除节点，默认是0
    defaultSelector: RR //默认的选择器
    //RR 循环获取
    //RONDOM 随机获取
    //ORDER 秩序获取
};
var poolCluster = mysql.createPoolCluster();

//添加初始化参数
poolCluster.add(config);
poolCluster.add('MASTER', masterConfig);
poolCluster.add('SLAVE1', slave1Config);
poolCluster.add('SLAVE2', slave2Config);

//清除初始化参数
poolCluster.remove('SLAVE1');
poolCluster.remove('SLAVE*');


//从所有集群中获取连接，默认是循环获取的
poolCluster.getConnection(function(err, connection) {

});

//从主进程获取连接 循环选取
poolCluster.getConnection('MASTER', function (err, connection) {

});

//从从进程获取连接，秩序获取，如果从1连接不上，获取从2的，把从1从集群中移除
poolCluster.on('remove', function (nodeId) {
    console.log('被移除的'+nodeId);
});
poolCluster.getConnection('SLAVE*', 'ORDER', function (err, connection) {

});

// of namespace : of(集群名, 选择器)
//选择器：random order round-robin
poolCluster.of('*').getConnection(function (err, connection) {});

var pool1 = poolCluster.of('SLAVE*', 'RANDOM');
pool1.getConnection(function (err, connection) {});

//关闭
poolCluster.end(function (err) {

});


//切换用户改变连接状态 charset字符集
connection.changeUser({user: 'zby',password: '123', charset: '*', database: 'data1'});

//query语句第三种写法 field字段
connection.query({
    sql: 'SELECT * FROM "books" WHERE "author" = ?',
    timeout: 40000 //40ms
},['David'],function (err, ret, fields) {

});

//获取连接的id
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

//连接中的事件
var query = connection.query('SELECT * FROM posts');
query
    .on('error', function(err) {
        // Handle error, an 'end' event will be emitted after this as well
    })
    .on('fields', function(fields) {
        // the field packets for the rows to follow
    })
    .on('result', function(row) {
        // Pausing the connnection is useful if your processing involves I/O
        connection.pause();

        processRow(row, function() {
            connection.resume();
        });
    })
    .on('end', function() {
        // all rows have been received
    });


//当查询列名重复时，在query语句对象中增加nestTables: true，可返回一个包含表名的数组，内含有查询的列
var options1 = {sql: '...', nestTables: true};
connection.query(options, function(err, results) {
    /* results will be an array like this now:
     [{
     table1: {
     fieldA: '...',
     fieldB: '...',
     },
     table2: {
     fieldA: '...',
     fieldB: '...',
     },
     }, ...]
     */
});

var options2 = {sql: '...', nestTables: '_'};
connection.query(options, function(err, results) {
    /* results will be an array like this now:
     [{
     table1_fieldA: '...',
     table1_fieldB: '...',
     table2_fieldA: '...',
     table2_fieldB: '...',
     }, ...]
     */
});

//错误信息整理 err.code
// ER_BAD_DB_ERROR 数据库错误
// ECONNREFUSED nodejs错误
// ER_ACCESS_DENIED_ERROR 数据库错误
// PROTOCOL_CONNECTION_LOST 连接错误

//常用sql语句
/**
 * 创建表
 * CREATE TABLE table_name
 * 删除表
 * DROP TABLE table_name
 * 插入数据
 * INSERT INTO table_name[（字段1）] VALUES(值1)
 * 如果一一对应可以不写字段
 * 删除数据
 * DELETE FROM table_name WHERE id='10'
 * delete不能删除一列，可用update更新列
 * 更新数据
 * UPDATE table_name SET id='10' WHERE name='11' ORDER BY birth DESC
 * ASC升序 DESC降序
 * 查询数据
 * SELECT * FROM table_name WHERE name='11'
 * WHERE 后面可以是> AND OR
 * SELECT name, birth FROM table_name
 * SELECT chinese+english FROM table_name
 * 可进行运算
 * SELECT DISTINCT owner FROM table_name
 * 关键字搜索
 * 搜索可结合WHERE和ORDERBY语句
 * nameIS NOT NULL 取不为空
 *
 *
 */

