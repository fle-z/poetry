<?php
// 严格开发模式
error_reporting( E_ALL );
//ini_set('display_errors', 1);

Header("Content-Type:text/html;charset=utf-8");

// 永不超时
ini_set('max_execution_time', 0);
set_time_limit(0);
// 内存限制，如果外面设置的内存比 /etc/php/php-cli.ini 大，就不要设置了
if (intval(ini_get("memory_limit")) < 1024)
{
    ini_set('memory_limit', '1024M');
}


// 设置时区
date_default_timezone_set('Asia/Shanghai');

//核心库目录
define('CORE', dirname(__FILE__));
define('PATH_ROOT', CORE."/../");
define('PATH_DATA', CORE."/../data");
define('PATH_LIBRARY', CORE."/../library");
//系统配置
if( file_exists( PATH_ROOT."Conf/db.php" ) )
{
    require PATH_ROOT."/Conf/db.php";
}

require CORE.'/db.php';
error_reporting(7);
/**
 * 自动加载类库处理
 * @return void
 */
function __autoload( $classname )
{
    $classname = preg_replace("/[^0-9a-z_]/i", '', $classname);
    if( class_exists ( $classname ) ) {
        return true;
    }
    $classfile = $classname.'.php';
    try
    {
        if ( file_exists ( PATH_LIBRARY.'/'.$classfile ) )
        {
            require PATH_LIBRARY.'/'.$classfile;
        }
        else
        {
            throw new Exception ( 'Error: Cannot find the '.$classname );
        }
    }
    catch ( Exception $e )
    {
        log::error($e->getMessage().'|'.$classname);
        exit();
    }
}
