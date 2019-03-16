<?php
/**
 * 数据库类
 */
require_once "../Conf/db.php";

class db
{
    private $config = array();
    private $conn = null;

    public function __construct($config = array())
    {
        if (empty($config))
        {
            // 记住不要把原来有的配置信息给强制换成$GLOBALS['config']['db']，否则换数据库会有问题
            $this->config = empty($config) ? $GLOBALS['config']['db'] : $config;
        }
        else
        {
            $this->$config = $config;
        }
        $host = $this->config['host'];
        $user = $this->config['user'];
        $pwd = $this->config['pass'];
        $dbName = $this->config['name'];
        $this->connect($host, $user, $pwd);
        $this->switchDb($dbName);
    }

    //负责链接
    private function connect($host, $user, $pwd) {
        $conn = mysql_connect($host, $user, $pwd);
        mysql_query("set names 'utf8'");//编码转化
        if(!$conn){
            die("could not connect to the database:</br>".mysql_error());//诊断连接错误

        }
        $this->conn = $conn;
    }

    //负责切换数据库
    public function switchDb($db) {
        $sql = 'use ' . $db;
        mysql_query($sql);
    }

    //sql语句直接查询
    public function query($sql) {
        $res = mysql_query($sql);
        $list = array();
        $rs = mysql_query($sql);
        if (!$rs) {
            return false;
        }
        while ($row = mysql_fetch_assoc($rs)) {
            $list[] = $row;
        }
        return $list;
    }

    /**
     * 插入记录的操作
     * @param array $array
     * @param string $table
     * @return boolean
     */
    function insert($array,$table){
        $keys=join(',',array_keys($array));
        $values="'".join("','", array_values($array))."'";
        $sql="insert {$table}({$keys}) VALUES ({$values})";
        $res=mysql_query($sql);
        if($res){
            return mysql_insert_id();
        }else{
            return false;
        }
    }


    /**
     * MYSQL更新操作
     * @param array $array
     * @param string $table
     * @param string $where
     * @return number|boolean
     */
    function update($array,$table,$where=null){
        foreach ($array as $key=>$val){
            $sets.=$key."='".$val."',";
        }
        $sets=rtrim($sets,','); //去掉SQL里的最后一个逗号
        $where=$where==null?'':' WHERE '.$where;
        $sql="UPDATE {$table} SET {$sets} {$where}";
        $res=mysql_query($sql);
        if ($res){
            return mysql_affected_rows();
        }else {
            return false;
        }
    }


    /**
     * 删除记录的操作
     * @param string $table
     * @param string $where
     * @return number|boolean
     */
    function delete($table,$where=null){
        $where=$where==null?'':' WHERE '.$where;
        $sql="DELETE FROM {$table}{$where}";
        $res=mysql_query($sql);
        if ($res){
            return mysql_affected_rows();
        }else {
            return false;
        }
    }

    //负责获取多行多列的select结果
     public function getAll($table, $fields = "*", $where = "TRUE", $sort = "") {
         $sql = "SELECT " . $fields . " FROM " . $table . " WHERE " . $where;
         $list = array();
         $rs = mysql_query($sql);
         if (!$rs) {
             return false;
         }
         while ($row = mysql_fetch_assoc($rs)) {
             $list[] = $row;
         }
         return $list;
     }

     public function getRow($sql) {
         $rs = $this->query($sql);
         if(!$rs) {
             return false;
         }
         return mysql_fetch_assoc($rs);
     }

     public function getOne($sql) {
         $rs = $this->query($sql);
         if (!$rs) {
             return false;
         }
         return mysql_fetch_assoc($rs);
         return $row[0];
     }

     public function close() {
         mysql_close($this->conn);
     }
}
