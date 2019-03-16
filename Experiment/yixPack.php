<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

/**
 * 获取所有意象名称
 */
function getAllYix(){
    $node = array();
    $index = 0;
    $db_yix = new db();
    $yix = $db_yix->getAll($table = "poetry_yix", $fields = "yix");
    //存意象节点
    for($index = 0; $index < count($yix); $index++){
        $yix[$index]['yix'] = explode('|', $yix[$index]['yix']);
        //如果多个意象表示同一个，则节点名称为第一个
         $node[$index] = $yix[$index]['yix'];
    }

    return $node;
 }

function getWord(){
    $fenci = file_get_contents('../Data/fenci/all.json');
    $fenci = (array)json_decode($fenci);

    return $fenci;
}


function getPack(){
    $yix = getAllYix();
    $fenci = getWord();
    $node = array();
    $data = array();
    for($i = 0; $i < sizeof($yix); $i++){
        $arr = array();
        for($j = 0; $j < sizeof($yix[$i]); $j++){
            foreach($fenci as $key=>$values ){
                if (strstr( $key , $yix[$i][$j] ) != false){
                    if($values != 0){
                        $tmp['name'] = $key;
                        $tmp['size'] = $values;
                        array_push($arr, $tmp);
                    }
                }
            }
        }
        array_push($data, array('name'=>$yix[$i][0], 'children'=>$arr));
    }
    array_push($node, array('name'=>'node', 'children'=>$data));

    return $node;
}

$node = getPack();
var_dump($node);
file_put_contents('../Data/fenci/allYixPack.json', json_encode($node));
