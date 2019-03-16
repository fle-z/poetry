<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$query = json_decode($_POST['query']);
$dynasty = "";
$type = "";
$author = "";
for($i = 0; $i < sizeof($query); $i++){
    switch (key($query[$i])) {
        case "dynasty":
            if(strlen($dynasty) != 0){
                $dynasty = $dynasty." or ";
            }
            $dynasty = $dynasty."dynasty = '".$query[$i]['dynasty']."'";
            break;
        case "type":
            if(strlen($type) != 0){
                $type = $type." or ";
            }
            $type = $type."type = '".$query[$i]['type']."'";
            break;
        case "author":
            if(strlen($author) != 0){
                $author = $author." or ";
            }
            $author = $author."author = '".$query[$i]['author']."'";
            break;
    }

}
if(strlen($dynasty) != 0){
    $where = $where."($dynasty)";
}else{
    $where = $where." true";
}
if(strlen($type) != 0){
    $where = $where." and "."($type)";
}else{
    $where = $where." and true";
}
if(strlen($author) != 0){
    $where = $where." and "."($author)";
}else{
    $where = $where." and true";
}
$sql = "select id, author,type from poetry_emotion where ".$where;
$db = new db();
$data = $db->query($sql);
for($i = 0; $i < sizeof($data); $i++){
    $data[$i]['word'] = $db->query("select word from poetry_emotion_word where poetry_id=".$data[$i]['id']);
}
// var_dump($data);
echo json_encode($data);
