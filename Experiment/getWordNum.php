<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$author = $_POST['author'];
$table = $_POST['table'];
if($table == "") $table = "quantangshi";
// $author = '苏轼';
$ret = array();
$db = new db();
if($author != ""){
    if($table == "quantangshi"){
        $poet_id = $db->query("select id from poets_tang where name='".$author."'");
        $data = $db->getAll($table, $fields = "word, pos", $where=" poet_id=".$poet_id[0]['id']);
    }else{
        $data = $db->getAll($table, $fields = "word, pos", $where=" author='".$author."'");
    }
    for($i = 0; $i < sizeof($data); $i++){
        $word = explode(",", $data[$i]['word']);
        $pos = explode(",", $data[$i]['pos']);
        $tmp = array();
        for($j = 0; $j < sizeof($pos); $j++){
            if($pos[$j] == 'n' || $pos[$j] == 'ns' || $pos[$j] == 'nl'){
                if($word[$j] != '人' && $word[$j] != '时' && $word[$j] != '君')
                    array_push($ret, $word[$j]);
            }
        }
    }

    $x = array_count_values($ret);
    arsort($x);
    $ci = array_slice($x, 0, 99);//取前一百个名词
}else{
    $ret = file_get_contents("../Data/".$table."_phrase.json");
    $ci = array_slice(json_decode($ret, true), 0, 99);//取前一百个名词
}
// file_put_contents("../Data/".$table."_phrase.json", json_encode($x));
echo json_encode($ci);
