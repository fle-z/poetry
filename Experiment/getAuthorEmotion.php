<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

//选择27个诗人
$author_display = array('李白', '杜甫', '白居易', '王维', '吴文英', '辛弃疾',
        '苏轼', '李商隐', '岑参', '晏几道', '陆游', '高适',
        '孟浩然', '柳宗元', '柳永', '杜牧', '李清照', '韦庄',
        '刘禹锡', '李贺', '晏殊', '温庭筠', '周邦彦', '欧阳修',
        '王昌龄', '秦观', '韦应物');
$db = new db();
$data = array();
for($i = 0; $i < sizeof($author_display); $i++){
    $tmp = $db->query("SELECT COUNT(*) AS count, emotion FROM poetry_emotion WHERE author = '".$author_display[$i]."' GROUP BY emotion");
    for($j = 0; $j < sizeof($tmp); $j++){
        array_push($data, array(
            'author'  => $author_display[$i],
            'emotion' => $tmp[$j]['emotion'],
            'size'   => $tmp[$j]['count']
        ));
    }
}
var_dump($data);
//file_put_contents('../Data/authorEmotion.json', json_encode($data));
