<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$fenci = file_get_contents('../Data/fenci.json');
$fenci = (array)json_decode($fenci);

$node = $_POST['node'];
$db = new db();
$node = $db->getAll($table = "poetry_yix", $fields = "yix",   $where="yix like '%".$node."%'");
$yix = array();
$yix = explode('|', $node[0]['yix']);
foreach($fenci as $key=>$values ){
    for($i = 0; $i < sizeof($yix); $i++){
        if (strstr( $key , $yix[$i] ) !== false ){
            $arr[$key] = $values;
        }
    }
}
arsort($arr);
$ci = array_slice($arr, 0, 20);//取前一百个名词

$word = array();
foreach($ci as $key=>$values ){
    $temp = array(
        'name' => $key,
        'size' => $values
    );
    array_push($word, $temp);
}

echo json_encode($word);

function getWhere($db, $yix1){

    $where = "content like '%".$arr[0]."%'";
    for($i = 1; $i < sizeof($arr); $i++){
        $where = $where." OR content like '%".$arr[$i]."%'";
    }
    return $where;
}
