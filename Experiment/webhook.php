<?php
require dirname(dirname(__FILE__)).'/Core/init.php';

class webhook{
    public $id = 0;
    public function __construct(){
    }

    public function webhook(){
        $user_secret = 'ZjMzRiM2NjNzM5Mz-3909fefe25cc48a';//change to your user_secret
        $sign2 = $_POST['sign2'];
        $url = $_POST['url'];
        $timestamp = $_POST['timestamp'];
        if (md5($url . $user_secret . $timestamp) === $sign2) {
            $data = $_POST['data'];

            echo $_POST['data_key'];
            return $data;
        } else {
            echo "安全校验未通过拒绝响应";
        }
    }



/*
    public function saveData(){
        $data = array(
            'article_title'       => '42452',
            'weixin_name'     => '大嘎达风格',
            'article_agree_count' => 10,
            'article_public_time' => '1464566656',
            'article_cover'       => 'dsavdv',
            'article_brief'       => 'asdvfdasvsdf'
        );
        $db = new db();
        $result = $db->insert($data, "weixin_public_data");
        if($result){
            echo "数据库存储成功";
        }else{
            echo "数据库存储失败";
            echo $result;
        }
    }
*/
}
