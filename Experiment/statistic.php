<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

if(true){
    $db = new db();
    $emotion = $db->query("select emotion from poetry_emotion GROUP by emotion ");

    $word = array();
    $index = 0;
    for($i = 0; $i < count($emotion); $i++){
        //根据不同的情感，查询分词记录
        $data[$emotion[$i]['emotion']] = $db->getAll($table = "poetry_emotion", $fields = "word", $where="emotion='".$emotion[$i]['emotion']."'");
        //对每一个分词记录分隔，然后存到word中
        for($j = 0; $j < count($data[$emotion[$i]['emotion']]); $j++){
            $temp = $data[$emotion[$i]['emotion']];
            $word = array_merge($word, explode(',', $temp[$j]['word']));
        }
    }
    //var_dump($word);
    $x = array_count_values($word);
    arsort($x);
    var_dump($x);
    file_put_contents('../Data/fenci/all.json', json_encode($x));
}
// $fenci = file_get_contents('../Data/fenci.json');
// $fenci = (array)json_decode($fenci);
// arsort($fenci);
// $ci = array_slice($fenci, 0, 99);//取前一百个名词
// echo json_encode($ci);
// echo count($fenci);
// print_r($fenci);
