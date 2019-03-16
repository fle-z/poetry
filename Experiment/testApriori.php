<?php
require dirname(dirname(__FILE__)).'/Core/init.php';
include "Apriori.php";

/**
 * 取出所有的意象，并将表示成一个意象的词分割
 */
function getAllYix(){
    $db = new db();
    $node = $db->getAll($table = "poetry_yix", $fields = "yix");
    $yix = array();
    for($i = 0; $i < sizeof($node); $i++){
        $yix[$i] = explode('|', $node[$i]['yix']);
    }

    return $yix;
}

/**
 * 从数据库中读取每一首诗包含那几种意象
 */

 function getAprioriData($emotion){
    $db = new db();
    $content = $db->query("select id, content from poetry_emotion where emotion='".$emotion."'");
    $yix = getAllYix();
    $data = array();
    for($i = 0; $i < sizeof($content); $i++){
        $tmp = array();
        for($j = 0; $j < sizeof($yix); $j++){
            for($k = 0; $k < sizeof($yix[$j]); $k++){
                if(strstr($content[$i]['content'], $yix[$j][$k])){
                    array_push($tmp, $yix[$j][0]);
                    break;
                }
            }
        }
        $data[$i] = $tmp;
    }

    return $data;
}

function Apriori($data){
    $CItemset = array();//备选集
    $lItemset = array();//获取备选集$CItemset满足支持度的集合
    $n = 0;
    $apriori = new Apriori();
    $CItemset[$n] = $apriori->getFristCandiate($data); //获取第一次的备选集
    $lItemset[$n] = $apriori->getSupportedItemset($data, $CItemset[$n]); //获取备选集$CItemset满足支持度的集合

    $flag = true;
    while ($flag) {
        $itemset = $apriori->getNextCandidate($lItemset[$n]);// 获取第下一次的备选集
        if(sizeof($itemset) == 0){
            $flag = false;
            break;
        }
        $CItemset[$n+1] = $itemset;
        $lItemset[$n+1] = $apriori->getSupportedItemset($data, $CItemset[$n+1]); //获取本次备选集$CItemset满足支持度的集合
        $n++;
    }
    //var_dump($CItemset);
    var_dump($lItemset);
    var_dump(Apriori::$dCountMap);
    for($i = 1; $i < sizeof($lItemset); $i++){
        for($j = 0; $j < sizeof($lItemset[$i]); $j++){
            $count = Apriori::$dCountMap[$i][$j];
            $confidence[$i][$j] = $apriori->confidence($lItemset[$i][$j], $lItemset, $count);
        }
    }
    var_dump($confidence);
}
$emotion = '思念';
$data = getAprioriData($emotion);
// var_dump($data);
Apriori($data);
