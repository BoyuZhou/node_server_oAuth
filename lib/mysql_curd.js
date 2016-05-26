/**
 * Created by guzi on 2016/5/26.
 */
var mysql = require('mysql');
//����һ��connection
//options
// host ������ַ
// user �û���
// password
// port
//database ���ݿ���
//charset �����ַ�����Ĭ�ϡ�UTF8_GENERAL_CI' Ҫ���д��
//localAddress ����TCP���ӵ�IP
//scoketPath ���ӵ�unix·������host��portʱ�����
//timezone ʱ��
//connectTimeout ���ӳ�ʱ
//stringifyObjects �Ƿ����л�����Ĭ��false
//typeCast �Ƿ�ֵת��Ϊ����javascript����(Ĭ��true)
//queryFormat �Զ���query����ʽ������
//supportBigNumbers ���ݿ�֧��bigint����decimal��������Ϊtrue
//bigNumberStrings  ǿ��bigint��decimal����javascript�ַ������ͷ���
//debug ��������
//mulitipleStatements �Ƿ�����һ��query�ж��MySQL���
//flags �����޸����ӱ�־
//ssl ʹ��ssl��������crypto.createCredenitals������ʽһ������һ������ssl�����ļ����Ƶ��ַ�����Ŀǰֻ����Amazon RDS�������ļ�


var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123',
    port: '3306'
});
//����һ��connection
connection.connect(function (err) {
    if (err) {
        console.log('[query] - :' + err);
        return;
    }
    console.log('[connection connect] successd!');
});

//ִ��SQL���
connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) {console.log('[query] - :'+err);
    return;
    }
    console.log('The solution is: ',rows[0].solution);
});

//�ر�connection
connection.end(function (err) {
    if (err) return;
    console.log('[connection end] successed!');
});

//��
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

//��
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

//��
var userGetSql = 'SELECT * FROM userinfo';

connection.query(userGetSql, function (err, ret) {

});

//ɾ
var userDelSql = 'DELETE FROM userinfo';
connection.query(userDelSql, function (err, ret) {

});

//connection.end()//��query���ִ����
//connection.destory()//ֱ����ֹ����

//waitForConnections �����ӳ�û�����ӻ򳬳��������ʱ������Ϊtrue�һ�����ӷ�����У�����Ϊfalse�᷵��error
//connectionLimit ���������ƣ�Ĭ��10
//queueLimit �������������� Ĭ��0�������ƣ�
//�������ӳ�
var pool = mysql.createPool({
    host: '127.0.0.2',
    user: 'root',
    password: '123'
});
//*������ʹ��֮ǰ������session�Ự
pool.on('connection', function (connection) {
    connection.query('SET SESSION auto_increment_increment = 1');
});

//*���ӳط��������¼�����һ���ص������ڵȴ�����
pool.on('enqueue', function () {
    console.log('�ȴ����õ�����');
});

//ֹͣ��������
pool.end();

//ֱ��ʹ��
pool.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) console.error(err);

    console.log('The solution is: ',rows[0].solution);

});

//����
pool.getConnection(function (err, connection) {
    connection.query('', function () {
        connection.release();
    });
});

var db_config={};
//��������
function handleDisconnect () {
    connection = mysql.createConnection(db_config);
    connection.connect(function (err) {
        if (err) {
           console.log('���ж�������'+new Date());
            setTimeout(handleDisconnect, 2000);
            return;
        }
        console.log('���ӳɹ�');
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

//��ֹSQLע�룬ʹ��mysql.escape(), connection.escape() or pool.escape()
//ʹ���ʺţ�д�������Բ���ת��
var userId = 1;
var columns = ['username', 'email'];
var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function(err, results) {
    // ...
});


//ʹ���Զ������
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



//���Ӽ�Ⱥ

var config={
    canRetry: true, //Ĭ��true���Ƿ��Զ�����
    removeNodeErrorCount: 5, //Ĭ��Ϊ5�����ڵ�Ĵ�������������ֵ����������ڵ�
    restoreNodeTimeout: 200, //�������ʧ�ܣ�����һ�����ӳ�������ǰָ���������������0��ֱ��ɾ���ڵ㣬Ĭ����0
    defaultSelector: RR //Ĭ�ϵ�ѡ����
    //RR ѭ����ȡ
    //RONDOM �����ȡ
    //ORDER �����ȡ
};
var poolCluster = mysql.createPoolCluster();

//��ӳ�ʼ������
poolCluster.add(config);
poolCluster.add('MASTER', masterConfig);
poolCluster.add('SLAVE1', slave1Config);
poolCluster.add('SLAVE2', slave2Config);

//�����ʼ������
poolCluster.remove('SLAVE1');
poolCluster.remove('SLAVE*');


//�����м�Ⱥ�л�ȡ���ӣ�Ĭ����ѭ����ȡ��
poolCluster.getConnection(function(err, connection) {

});

//�������̻�ȡ���� ѭ��ѡȡ
poolCluster.getConnection('MASTER', function (err, connection) {

});

//�Ӵӽ��̻�ȡ���ӣ������ȡ�������1���Ӳ��ϣ���ȡ��2�ģ��Ѵ�1�Ӽ�Ⱥ���Ƴ�
poolCluster.on('remove', function (nodeId) {
    console.log('���Ƴ���'+nodeId);
});
poolCluster.getConnection('SLAVE*', 'ORDER', function (err, connection) {

});

// of namespace : of(��Ⱥ��, ѡ����)
//ѡ������random order round-robin
poolCluster.of('*').getConnection(function (err, connection) {});

var pool1 = poolCluster.of('SLAVE*', 'RANDOM');
pool1.getConnection(function (err, connection) {});

//�ر�
poolCluster.end(function (err) {

});


//�л��û��ı�����״̬ charset�ַ���
connection.changeUser({user: 'zby',password: '123', charset: '*', database: 'data1'});

//query��������д�� field�ֶ�
connection.query({
    sql: 'SELECT * FROM "books" WHERE "author" = ?',
    timeout: 40000 //40ms
},['David'],function (err, ret, fields) {

});

//��ȡ���ӵ�id
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

//�����е��¼�
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


//����ѯ�����ظ�ʱ����query������������nestTables: true���ɷ���һ���������������飬�ں��в�ѯ����
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

//������Ϣ���� err.code
// ER_BAD_DB_ERROR ���ݿ����
// ECONNREFUSED nodejs����
// ER_ACCESS_DENIED_ERROR ���ݿ����
// PROTOCOL_CONNECTION_LOST ���Ӵ���

//����sql���
/**
 * ������
 * CREATE TABLE table_name
 * ɾ����
 * DROP TABLE table_name
 * ��������
 * INSERT INTO table_name[���ֶ�1��] VALUES(ֵ1)
 * ���һһ��Ӧ���Բ�д�ֶ�
 * ɾ������
 * DELETE FROM table_name WHERE id='10'
 * delete����ɾ��һ�У�����update������
 * ��������
 * UPDATE table_name SET id='10' WHERE name='11' ORDER BY birth DESC
 * ASC���� DESC����
 * ��ѯ����
 * SELECT * FROM table_name WHERE name='11'
 * WHERE ���������> AND OR
 * SELECT name, birth FROM table_name
 * SELECT chinese+english FROM table_name
 * �ɽ�������
 * SELECT DISTINCT owner FROM table_name
 * �ؼ�������
 * �����ɽ��WHERE��ORDERBY���
 * nameIS NOT NULL ȡ��Ϊ��
 *
 *
 */

