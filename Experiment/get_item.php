<?php
require dirname(dirname(__FILE__)).'/Core/init.php';
/**
 *接收sankey.html的参数，并获取诗的情感的内容传递过去
 */
$item = $_POST['item'];
$db = new db();
$data = $db->query("select ".$item." from poetry_".$item." GROUP BY ".$item);
echo json_encode($data);

// $node = array();
// $db_yix = new db();
// $yix = $db_yix->getAll($table = "poetry_yix", $fields = "yix, kind");
// //存意象节点
// for($i = 0; $i < count($yix); $i++){
//     $temp = explode('|', $yix[$i]['yix']);
//     for($j = 0; $j < sizeof($temp); $j++){
//         array_push($node, $temp[$j]);
//     }
// }
//
// $db = new db();
// $data = @$db->getAll($table = "poetry_emotion", $fields = "id, word");
// $word = array();
// for($j = 0; $j < count($data); $j++){
//     $data[$j]['word'] = explode(',', $data[$j]['word']);
//     for($i = 0; $i < count($data[$j]['word']); $i++){
//         for($a = 0; $a < sizeof($node); $a++){
//             if(strstr($data[$j]['word'][$i], $node[$a])){
//                 $item = array(
//                     "poetry_id" => $data[$j]['id'],
//                     "word" => $data[$j]['word'][$i]
//                 );
//                 $db->insert($item, "poetry_emotion_word");
//                 break;
//             }
//         }
//
//     }
// }
