<?php
require_once "webhook.php";

$data = array();
$s = new webhook();
$data = $s -> webhook();

$data = stripslashes($data);
$data = json_decode($data, true);
preg_match('/\d+/',$data['evaNum'],$num);
preg_match('/\d+/',$data['time'],$time);
$content = strip_tags($data['content']);//去除html标签
$content = preg_replace('/\(.*?\)/', "", $content);//去除（）以及之间的内容
$content = str_replace(array("\r\n", "\r", "\n"), "", $content);//去除换行符
$wx = array(
    'title'       => $data['title'],
    'author'      => $data['author'],
    'content'     => $content,
    'dynasty'     => $data['dynasty'],
    'eva_num'     => $num[0],
    'time'        => $time[0]
);

if(is_array($wx)){
    $db = new db();
    $result = $db->insert($wx, "poetry_author");
}
