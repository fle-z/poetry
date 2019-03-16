<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$db = new db();
$data = $db->getAll($table = "quantangshi", $fields = "id, content", $where=" word is NULL");
//var_dump($content);
echo json_encode($data);
