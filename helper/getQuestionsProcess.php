<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for getting data to build tableQuestion.
 */
class getQuestionsProcess extends AbstractHelper
{
    protected $view;
    protected $api;
    protected $user;
    protected $properties=[];

    /**
     * 
     * @param array   $props    les propriétés utiles

     */
    public function __invoke($props=null)
    {
        $this->view = $this->getView();
        $this->api = $this->view->api();
        $this->user = $this->view->identity();
        $jsUser = $this->user ? json_encode(['name'=>$this->user->getName(),'email'=>$this->user->getEmail(),'id'=>$this->user->getId(),'role'=>$this->user->getRole()]) : 'false';
        //initialisation des datas
        $data = [
            "name"=> "Domaine d'exploration",
            "children"=> []
        ];
        $process = [];

        //récupère les domaines de recherche
        $param = array();
        $param['property'][0]['property']= "8";
        $param['property'][0]['type']='eq';
        $param['property'][0]['text']='Thème général'; 
        $rsDR =  $this->api->search('item_sets', $param)->getContent();
        foreach ($rsDR as $dr) {
            //récupère les items
            $items = $this->api->search('items', ['item_set_id' => $dr->id(),'sort_by'=>"jdc:ordreCrible"])->getContent();
            //construction de la réponse
            $dtDR = ["name"=> $dr->displayTitle(),"id"=> $dr->id()];
            $dtP = ["name"=> $dr->displayTitle()];
            if(count($items)){
                $dtDR["children"]= $this->setChildren(0, $items);
                $dtP = $this->setProcess($dtP, $items);
            }
            $data['children'][]=$dtDR;
            $process[]=$dtP;
        }
        $this->view->headScript()->appendScript('const dataQuestions = '.json_encode($data).';
            
            const dataProcess = '.json_encode($process).';
        
            const user = '.$jsUser.';
        ');
    }
    function setChildren($i, $rs){
        $dtDR = ["name"=> $rs[$i]->displayTitle(),"id"=> $rs[$i]->id()];
        if($i+1 < count($rs))$dtDR["children"]= $this->setChildren($i+1, $rs);
        return [$dtDR];
    }
    function setProcess($p, $rs){
        foreach ($rs as $i => $q) {
            $p["question ".$q->id()]=count($this->getReponses($q));
        }
        return $p;
    }
    /**
     * //récupère les réponses de l'utilisateur pour la question 
     *
     * @param o:resource    $q
     * @return array
     */
    function getReponses($q){

        //requête pour récupèrer les positions pour un crible et un document
        $query = array();
        $query['property'][0]['property']= $this->getProperty('jdc:hasDoc')->id();
        $query['property'][0]['type']='res';
        $query['property'][0]['text']=$q->id(); 
        $query['property'][0]['joiner']="and"; 
        $query['property'][1]['property']= $this->getProperty('ma:hasRatingSystem')->id();
        $query['property'][1]['type']='res';
        $query['property'][1]['text']=$q->id(); 
        $query['property'][1]['joiner']="and"; 
        $query['property'][1]['property']= $this->getProperty('jdc:hasActant')->id();
        $query['property'][1]['type']='res';
        $query['property'][1]['text']=$this->user->getId(); 
        $query['property'][1]['joiner']="and"; 

        $result = $this->api->search('items', $query)->getContent();

        return $result;
    }

    /**
     * //récupère une propriété0 
     *
     * @param string    $term
     * @return object
     */
    function getProperty($term){
        if(!isset($this->properties[$term]))      
            $this->properties[$term] = $this->api->search('properties', ['term' => $term])->getContent()[0];
        return $this->properties[$term];
    }


}
