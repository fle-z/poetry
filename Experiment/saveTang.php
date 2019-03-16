<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

function savePoetry(){
    $db = new db();
    $path = '../Library/ci';
    $poetry = array();
    for($i = 0; $i < 22; $i++){
        $file = '/ci.song.'.$i.'000.json';
        $filename = $path.$file;
        if(file_exists($filename)){
            $json = file_get_contents($path.$file);
            $arr = json_decode($json);
            //var_dump($arr);
            for($j = 0; $j < sizeof($arr); $j++){
                $poetry[$j]['author'] = $arr[$j]->author;
                //$poetry[$j]['strains'] = implode($arr[$j]->strains);
                $poetry[$j]['content'] = implode($arr[$j]->paragraphs);
                //$poetry[$j]['title'] = $arr[$j]->title;
                $poetry[$j]['rhythmic'] = $arr[$j]->rhythmic;
                $db->insert($poetry[$j], 'quansongci');
            }
        }else{
            echo $filename."该文件不存在！";
        }
    }
    //var_dump($poetry);
}
savePoetry();
