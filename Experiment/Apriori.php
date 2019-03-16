<?php
/**
 * *实现Apriori算法
 * @author tju_zyt@tju.edu.cn
 *
 */
class Apriori{
    public static $dCountMap = array(); //频繁集的记数表
    private static $MIN_SUP = 0.02; //最小支持度
    private static $MIN_CONF = 0.5; //最小置信度
    private static $confCount = array(); //置信度记录表
    private static $confItemset = array(); //满足支持度的集合

    /**
    * 算法的第一次迭代，对每个项出现次数计数
    * @param $data 存储数据的二维数组
    * @return $list 返回候选1项集
    */
    public function getFristCandiate($data){
        $count = array();
        for($i = 0; $i < sizeof($data); $i++){
            for($j = 0; $j < sizeof($data[$i]); $j++){
                if(!in_array($data[$i][$j], $count))
                    array_push($count, $data[$i][$j]);
            }
        }

        $list = array();
        for($i = 0; $i < sizeof($count); $i++){
            $arr = array();
            array_push($arr, $count[$i]);
            $list[$i] = $arr;
        }

        return $list;
    }

    /**
	 * 求出CItemset中满足最低支持度集合
     * @param $CItemset 备选集
	 */
    public function getSupportedItemset($data, $CItemset){
        $end = true;
        $supportedItemset = array();
        $n = sizeof($CItemset[0])-1;//记录这是第几项集
        $k = 0;
        for($i = 0; $i < sizeof($CItemset); $i++){
            $count = $this->countFrequent($data, $CItemset[$i]);//统计记录数
            if($count >= self::$MIN_SUP * (sizeof($data) - 1)){
                $supportedItemset[$k] = $CItemset[$i];
                self::$dCountMap[$n][$k] = $count;
                $k++;
            }
        }
        //var_dump(self::$dCountMap);
        return $supportedItemset;
    }

    /**
    * 统计数据库记录data出现 备选集 中的集合的个数
    * @param $data 数据表
    * @param $list 备选集中的某一项
    */
    public function countFrequent($data, $list){
        $count = 0;
        for($i = 0; $i < sizeof($data); $i++){
            $record = true;
            for($k = 0; $k < sizeof($list); $k++){
                if(!in_array($list[$k], $data[$i])){
                    $record = false;
                    break;
                }
            }
            if($record){
                $count++;
            }
        }

        return $count;
    }

    /**
    * 根据cItemset求出下一级的备选集合组，求出的备选集合组中的每个集合的元素的个数
    * 比cItemset中的集合的元素大1
    * @param $CItemset
    * @return $nextItemset
    */
    public function getNextCandidate($CItemset){
        $nextItemset = array();
        $count = 0;
        //取出每一项集
        for($k = 0; $k < sizeof($CItemset); $k++){
            //遍历其他项集的每一个元素，判断是否存在于该项集，如果不存在，则该加入该元素
            for($i = $k + 1; $i < sizeof($CItemset); $i++){
                for($j = 0; $j < sizeof($CItemset[$i]); $j++){
                    if(!in_array($CItemset[$i][$j], $CItemset[$k])){
                        $tmp = $CItemset[$k];//先临时储存，满足条件后在加入进去
                        //剪枝：即去掉子集不是频繁的项集
                        if($this->isSubsetInC($tmp, $CItemset[$i][$j], $CItemset)){
                            array_push($tmp, $CItemset[$i][$j]);
                            //去掉重复项
                            if(!$this->isHave($tmp, $nextItemset)){
                                $nextItemset[$count] = $tmp;
                                $count++;
                            }
                        }
                    }
                }
            }
        }

        return $nextItemset;
    }

    /**
    * 剪枝：即去掉子集不是频繁的项集
    * @param $itemset 前一项集的某一项，判断能否加入新项后是否是平凡集
    * @param $key 即将加入的一项
    * @param $CItemset 前一项集
    */
    public function isSubsetInC($itemset, $key, $CItemset){
        $record = 0; //记录子集匹配的个数
        for($i = 0; $i < sizeof($itemset); $i++){
            for($j = 0; $j < sizeof($CItemset); $j++){
                $subset = $itemset;
                $subset[$i] = $key;//分别替换掉每一项就是子集
                //如果相等，则记录加一
                if(sizeof(array_diff($subset, $CItemset[$j])) == 0){
                    $record++;
                    break;
                }
            }
        }
        if($record == sizeof($itemset)){
            return true;
        }

        return false;
    }

    /**
    * 判断将要加入的项是否已经存在是否已经存在
    * @param $list 将要加入的项
    * @param $itemset 项集
    */
    public function isHave($list, $itemset){
        for($i = 0; $i < sizeof($itemset); $i++){
            if(sizeof(array_diff($list, $itemset[$i])) == 0){
                return true;
            }
        }

        return false;
    }

    /**
    * 计算一个项集产生的关联规则的所有置信度
    * @param $itemset 要计算的某一项集
    * @param $lItemset 所有满足支持度的集合
    * @param $count 该项集的支持度
    * @return $confidence 求出满足最小置信度的关联数组
    */
    public function confidence($itemset, $lItemset, $count){
        $n = sizeof($itemset)-2;
        $lkItemset = $lItemset[$n];
        $confidence = array();
        $this->subset = array();
        $this->getAllSubSet(0, $itemset);//获得所有子集
        for($i = 0; $i < sizeof($this->subset); $i++){
            $n = sizeof($this->subset[$i])-1;
            if($n >= 0 && $n < sizeof($itemset)-1){
                $dkCountMap = self::$dCountMap[$n]; //根据大小，取出频繁集对应的支持度
                //比较取出每个子集对应的支持度，并计算出置信度
                for($j = 0; $j < sizeof($lItemset[$n]); $j++){
                    if(!array_diff($this->subset[$i], $lItemset[$n][$j])){
                        $conf = $count / $dkCountMap[$j] * 1.0;
                        if($conf >= self::$MIN_CONF){
                            $from = implode(",", $this->subset[$i]);
                            $to = implode(",", array_diff($itemset, $this->subset[$i]));
                            $confidence["$from ==> $to"] = $conf;
                        }
                    }
                }
            }

        }

        return $confidence;
    }

    /**
    * 递归排列组合，获得一个项集所有子集,包括全集和空集
    * @param $pos 记录将要放入子集的位置
    * @param $itemset 要计算子集的项集
    */
    public $p = array(); //记录将要放入子集的位置,每一次递归就有0,1两种选择，最后即可获得所有选择
    public $subset = array();
    public $subsetCount = 0;
    public function getAllSubSet($pos, $itemset){
        if($pos == sizeof($itemset)){
            $tmp = array();
            for($i = 0; $i < sizeof($itemset); $i++){
                if($this->p[$i] == 1){
                    array_push($tmp, $itemset[$i]);
                }
            }
            $count = $this->subsetCount;
            $this->subset[] = $tmp;
            $this->subsetCount++;
            return;
        }
        $this->p[$pos] = 0;
        $this->getAllSubSet($pos+1, $itemset);
        $this->p[$pos] = 1;
        $this->getAllSubSet($pos+1, $itemset);
    }
}
