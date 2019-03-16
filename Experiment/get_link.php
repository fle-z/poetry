<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

/**
 * 获取所有节点名称
 */
$node = array();
$index = 0;
$db_yix = new db();
$yix = $db_yix->getAll($table = "poetry_yix", $fields = "yix, kind");
//存意象节点
for($index = 0; $index < count($yix); $index++){
    $node[$index]['group'] = $yix[$index]['kind'];
    $yix[$index]['yix'] = explode('|', $yix[$index]['yix']);
    //如果多个意象表示同一个，则节点名称为第一个
    $node[$index]['name'] = $yix[$index]['yix'][0];
}

//存作者节点
$db_emotion = new db();
$author = $db_emotion->query("select author from poetry_author GROUP BY author");
for($temp = 0; $temp < count($author); $temp++){
    $node[$index]['name'] = $author[$temp]['author'];
    $index++;
}

//存主题节点
$db_emotion = new db();
$emotion = $db_emotion->query("select emotion from poetry_emotion GROUP BY emotion");
for($temp = 0; $temp < count($emotion); $temp++){
    $node[$index]['name'] = $emotion[$temp]['emotion'];
    $index++;
}

$nodes = json_encode($node);
file_put_contents("../Data/nodes.json", $nodes);

/**
 * 获取所有连接边
 */
$link = array();
$index = 0;
$db = new db();
//找出主题和意象的关系
for($i = 0; $i < count($yix); $i++){
    for($a = 0; $a < count($yix[$i]['yix']); $a++){
        if($a > 0) echo $yix[$i]['yix'][$a];
        $data = $db->query("select emotion,COUNT(*) as count FROM poetry_emotion where content like '%".$yix[$i]['yix'][$a]."%' GROUP BY emotion");
        for($j = 0; $j < count($data); $j++){
            //对几个相同的意象进行合并
            if($a > 0){
                $link[$index-1]['value'] = $link[$index-1]['value'] + intval($data[$j]['count']);
            }else{
                $b = 0;
                //从结果中找出主题
                for($b = 0; $b < count($node); $b++){
                    if($node[$b]['name'] == $data[$j]['emotion'])
                    break;
                }
                $link[$index]['target'] = $b;
                $link[$index]['source'] = $i;
                $link[$index]['value'] = intval($data[$j]['count']);
                $index++;
            }
        }
    }
}

//找出诗人和意象的关系
for($i = 0; $i < count($yix); $i++){
    for($a = 0; $a < count($yix[$i]['yix']); $a++){
        $data = $db->query("select author,COUNT(*) as count FROM poetry_author where content like '%".$yix[$i]['yix'][$a]."%' GROUP BY author");
        for($j = 0; $j < count($data); $j++){
            //对几个相同的意象进行合并
            if($a > 0){
                $link[$index - 1]['value'] = $link[$index - 1]['value'] + intval($data[$j]['count']);
            }else{
                $link[$index]['target'] = $i;
                $b = 0;
                //从结果中找出主题
                for($b = 0; $b < count($node); $b++){
                    if($node[$b]['name'] == $data[$j]['author'])
                    break;
                }
                $link[$index]['source'] = $b;
                $link[$index]['value'] = intval($data[$j]['count']);
                $index++;
            }
        }
    }

}

$links = json_encode($link);
file_put_contents("../Data/links.json", $links);
$graph = array();

$graph['links'] = $link;
$graph['nodes'] = $node;
$graph= json_encode($graph);
file_put_contents("../Data/graph.json", $graph);


// $db_link = new db();
// for($i = 0; $i < count($link); $i++){
//     $db_link->insert($link[$i], $table="yix2emotion");
// }
