<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$node = array();
$index = 0;
$db_yix = new db();
$yix = $db_yix->getAll($table = "poetry_yix", $fields = "yix");
//获取所有意象节点
for($index = 0; $index < count($yix); $index++){
    $yix[$index]['yix'] = explode('|', $yix[$index]['yix']);
    //如果多个意象表示同一个，则节点名称为第一个
    $node[$index]['name'] = $yix[$index]['yix'][0];
}

$link = array();
$n = 0;
$db = new db();
for($i = 0; $i < count($yix); $i++){
    for($j = $i+1; $j < count($yix); $j++){
        for($a = 0; $a < count($yix[$i]['yix']); $a++){
            for($b = 0; $b < count($yix[$j]['yix']); $b++){
                $data = $db->query("select COUNT(*) as count FROM poetry_emotion
                    where content like '%".$yix[$i]['yix'][$a]."%' and  content like '%".$yix[$j]['yix'][$b]."%'");
                if($a > 0 || $b > 0){
                    $link[$n]['weight'] = $link[$n]['weight'] + intval($data[0]['count']);
                    // echo intval($data[0]['count']);
                    // echo $link[$n]['weight'];
                }else{
                    $link[$n]['weight'] = intval($data[0]['count']);
                }
            }
        }
             $link[$n]['source'] = $i;
             $link[$n]['target'] = $j;
            if($link[$n]['weight'] > 0){
            }else{
                $link[$n]['weight'] = 0;
                $n--;
            }
            $n++;
    }
}
echo count($link);
file_put_contents("../Data/yix_relation.json", json_encode($link));
// $db_link = new db();
// for($i = 0; $i < count($link); $i++){
//     $db_link->insert($link[$i], $table="yix2yix");
// }
