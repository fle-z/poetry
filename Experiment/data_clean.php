<?php
require dirname(dirname(__FILE__)).'/Core/init.php';
/**
 *主要用来对数据进行清洗，去除空格，英文字母&nbsp等
 */
function trimall($str)//删除空格
{
    $before=array(" ", "　" ,"\t", "\n", "\r", "&nbsp;");
    $after=array("", "", "", "", "", "");
    return str_replace($before, $after, $str);
}

$db = new db();
$data = $db->query("select id, content from poetry_author");
for($i = 0; $i < count($data); $i++){
    $data[i]['content'] = trimall($data[i]['content']);
    $data[i]['content'] = preg_replace('/\(.*?\)/', "", $data[i]['content']);//去除（）以及之间的内容
    $db->update($data[i]['content'], $table="poetry_author", $where="id=".$data[i]['id']);
}

echo count($data);
