<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

function getALLWordByEmotion(){
    $db = new db();
    //WHERE emotion = '春天' or emotion = '夏天' or emotion = '秋天' or emotion = '冬天'
    $emotion = $db->query("select emotion from poetry_emotion GROUP by emotion");

    for($i = 0; $i < sizeof($emotion); $i++){
        $tmp = array();
        //根据不同的情感，查询分词记录
        $str = $db->getAll($table = "poetry_emotion", $fields = "word", $where="emotion='".$emotion[$i]['emotion']."'");
        //对每一个分词记录分隔，然后存到word中
        for($j = 0; $j < sizeof($str); $j++){
            $tmp = array_merge($tmp, explode(',', $str[$j]['word']));
        }
        $word[$emotion[$i]['emotion']] = $tmp;
    }

    foreach($word as $key => $value){
        $word[$key] = array_count_values($value);
        arsort($word[$key]);
    }

    return $word;
}

function getallWord(){
    $allWord = file_get_contents('../Data/fenci/allYixPack.json');
    $allWord = json_decode($allWord, true);

    return $allWord[0]['children'];
}

function getPieData(){
    $classifyWord = getALLWordByEmotion();
    $allWord = getallWord();

    $data = array();
    //遍历每一意象中的每一个词
    for($i = 0; $i < sizeof($allWord); $i++){
        for($j = 0; $j < sizeof($allWord[$i]['children']); $j++){
            $tmp = array();
            if( $allWord[$i]['children'][$j]['size'] > 3){
                //遍历不同情感中的词
                foreach($classifyWord as $k => $v){
                    foreach($v as $kk => $vv){
                        if($allWord[$i]['children'][$j]['name'] == $kk){
                            $tmp[$k] = $vv;
                        }
                    }
                }
                if(sizeof($tmp) < 10){
                    $tmp['class'] = $allWord[$i]['name'];
                    $tmp['name'] = $allWord[$i]['children'][$j]['name'];
                    array_push($data, $tmp);
                }
            }
        }
    }

    return $data;
}
$data = getPieData();
echo sizeof($data);
var_dump($data);
file_put_contents('../Data/fenci/allYixPie.json', json_encode($data));
// $classifyWord = getALLWordByEmotion();
// var_dump($classifyWord);
