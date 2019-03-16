<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$data = $_POST['data'];
$id = $_POST['id'];
$data = json_decode($data);
$data = $data[0];
$noun = array();//存储分词结果
$n = 0;
for($i = 0; $i < sizeof($data); $i++){
    for($j = 0; $j < sizeof($data[$i]); $j++){
        if($data[$i][$j]->pos != 'wp'){
            $noun['word'][$n] = $data[$i][$j]->cont;
            $noun['pos'][$n] = $data[$i][$j]->pos;
            $n++;
        }
    }
}
//echo json_encode($noun);
//file_put_contents("../Data/word.txt", $str, FILE_APPEND);
$db = new db();
for($i = 0; $i < sizeof($noun); $i++){
    $tmp = $db->getAll($table = "quantangshi", $fields = "word", $where=" id=".$id." and word is NULL");
    if(!empty($tmp)){
        $arr = implode(",", $noun['word']);
        $pos = implode(",", $noun['pos']);
        $word['word'] = $arr;
        $word['pos'] = $pos;
        $db->update($word, $table='quantangshi', $where=" id=".$id);
    }
}
