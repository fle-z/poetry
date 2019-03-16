<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$yix1 = $_POST["yix1"];
$yix2 = $_POST["yix2"];
// $yix1 = "酒";
// $yix2 = "飞鸟";
$db = new db();
$where1 = getWhere($db, $yix1);
$where2 = getWhere($db, $yix2);

$data = $db->query("SELECT emotion,COUNT(*) AS count FROM poetry_emotion
                    WHERE ($where1) AND ($where2) GROUP BY emotion");
for($i = 0; $i < sizeof($data); $i++){
    $sum = $db->query("SELECT COUNT(*) AS count FROM poetry_emotion WHERE emotion='".$data[$i]['emotion']."'");
    $data[$i]['sum'] = $sum[0]['count'];
}
//var_dump($data);
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
