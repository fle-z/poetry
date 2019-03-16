<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$yix1 = $_POST["yix1"];
$yix2 = $_POST["yix2"];
$db = new db();
if($yix2 != ""){
    $where1 = getWhere($db, $yix1);
    $where2 = getWhere($db, $yix2);
    $data = $db->getAll($table = "poetry_emotion", $fields = "*",
        $where="($where1) and ($where2)  limit 20");
}else{
    $data = $db->getAll($table = "poetry_emotion", $fields = "*",
        $where="(content like '%$yix1%')  limit 20");
}

echo json_encode($data);

function getWhere($db, $yix1){
    $yix1 = $db->getAll($table = "poetry_yix", $fields = "yix",   $where="yix like '%".$yix1."%'");
    $arr = array();
    $arr = explode('|', $yix1[0]['yix']);
    $where = "content like '%".$arr[0]."%'";
    for($i = 1; $i < sizeof($arr); $i++){
        $where = $where." OR content like '%".$arr[$i]."%'";
    }
    return $where;
}
