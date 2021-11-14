<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for getting data to build tableQuestion.
 */
class getTableQuestions extends AbstractHelper
{
    /**
     * 
     * @param array   $props    les propriétés utiles

     */
    public function __invoke($props=null)
    {
        $view = $this->getView();
        $user = $view->identity();
        $jsUser = $user ? json_encode(['name'=>$user->getName(),'email'=>$user->getEmail(),'id'=>$user->getId(),'role'=>$user->getRole()]) : 'false';
        //initialisation des datas
        $data = [
            "name"=> "Domaine d'exploration",
            "children"=> []
        ];
        //récupère les domaines de recherche
        $param = array();
        $param['property'][0]['property']= "8";
        $param['property'][0]['type']='eq';
        $param['property'][0]['text']='Thème général'; 
        $rsDR =  $view->api()->search('item_sets', $param)->getContent();
        foreach ($rsDR as $dr) {
            //récupère les items
            $items = $view->api()->search('items', ['item_set_id' => $dr->id(),'sort_by'=>"jdc:ordreCrible"])->getContent();
            //construction de la réponse
            $dtDR = ["name"=> $dr->displayTitle(),"id"=> $dr->id()];
            if(count($items))$dtDR["children"]= $this->setChildren(0, $items);
            $data['children'][]=$dtDR;
        }
        $view->headScript()->appendScript('const dataQuestions = '.json_encode($data).';
            
            const user = '.$jsUser.';
        ');
    }
    function setChildren($i, $rs){
        $dtDR = ["name"=> $rs[$i]->displayTitle(),"id"=> $rs[$i]->id()];
        if($i+1 < count($rs))$dtDR["children"]= $this->setChildren($i+1, $rs);
        return [$dtDR];
    }
}
