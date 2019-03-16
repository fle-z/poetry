<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

$table = "quantangshi";
$db = new db();
$yix = $db->getAll("poetry_yix", $fields = "yix");
//获取所有意象节点
for($index = 0; $index < count($yix); $index++){
    $yix[$index]['yix'] = explode('|', $yix[$index]['yix']);
}

/*$author = $db_emotion->query("SELECT author,count(*) AS count FROM quansongci
                                WHERE author != '无名氏'  GROUP BY author
                                ORDER BY count DESC LIMIT 50");*/
$author = $db->query("SELECT id, name as author from poets_tang AS p, (SELECT poet_id,count(*) AS count
                                FROM quantangshi GROUP BY poet_id
                                ORDER BY count DESC LIMIT 51) AS tmp1
                                WHERE p.id = tmp1.poet_id AND p.name != '佚名'");
// var_dump($author);
$data = array();
$n = 0;
for($a = 0; $a < sizeof($author); $a++){
    for($i = 0; $i < sizeof($yix); $i++){
        for($j = 0; $j < sizeof($yix[$i]['yix']); $j++){
            $tmp = $db->query("select COUNT(*) as count FROM ".$table."
                where content like '%".$yix[$i]['yix'][$j]."%' and  poet_id='".$author[$a]['id']."'");

            $data[$n]['size'] += $tmp[0]['count'];
        }
        $sum = $db->query("select count(*) as count from quantangshi where poet_id=".$author[$a]['id']);
        $data[$n]['size'] = $data[$n]['size']/$sum[0]['count']*100;
        $data[$n]['author'] = $author[$a]['author'];
        $data[$n]['yix'] = $yix[$i]['yix'][0];
        $n++;
    }
}
var_dump($data);
file_put_contents('../Data/authorYixTang.json', json_encode($data));
