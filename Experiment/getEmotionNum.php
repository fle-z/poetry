<?php
require dirname(dirname(__FILE__)).'/Core/init.php';
/**
 *接收pie.html的参数，并获取诗的情感的内容传递过去
 */
$db = new db();
$data = $db->query("select emotion, count(*) as value from poetry_emotion GROUP BY emotion");
echo json_encode($data);
