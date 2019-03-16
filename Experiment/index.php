<?php
require_once "webhook.php";

$data = array();
$s = new webhook();
$data = $s -> webhook();

$data = stripslashes($data);
$data = json_decode($data, true);
$content = strip_tags($data['content']);//去除html标签
$content = preg_replace('/\(.*?\)/', "", $content);//去除（）以及之间的内容
$content = str_replace(array("\r\n", "\r", "\n"), "", $content);//去除换行符
$content = trimall($content);
$wx = array(
    'title'       => $data['title'],
    'author'      => $data['author'],
    'content'     => $content,
    'dynasty'     => $data['dynasty'],
    'emotion'     => '忧国忧民',
    'type'        => '诗'
);

if(is_array($wx)){
    $db = new db();
    $result = $db->insert($wx, "poetry_emotion_copy");
}

function trimall($str)//删除空格
{
    $before=array(" ", "　" ,"\t", "\n", "\r", "&nbsp;");
    $after=array("", "", "", "", "", "");
    return str_replace($before, $after, $str);
}
