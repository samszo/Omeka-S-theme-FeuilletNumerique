<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for getting data to build sonar cartographie.
 */
class getCrible extends AbstractHelper
{
    /**
     * 
     * @param array   $id    identifiant du crible

     */
    public function __invoke($id=false)
    {
        if(!$id)return;
        $view = $this->getView();
        $api = $view->api();
        $user = $view->identity();
        $jsUser = $user ? json_encode(['name'=>$user->getName(),'email'=>$user->getEmail(),'id'=>$user->getId(),'role'=>$user->getRole()]) : 'false';
        
        //récupère la définition du crible
        $inScheme = $api->search('properties', ['term' => 'skos:inScheme'])->getContent()[0];
        $rt = $api->search('resource_templates', ['label'=>'Position sémantique : sonar'])->getContent()[0];        
        $c = $api->read('items',$id)->getContent();
        //récupère le domaine
        $d = $c->value('skos:broader')->valueResource();
        //récupère la liste des concepts
        $cpts = array();
        $param = array();
        $param['property'][0]['property']= $inScheme->id()."";
        $param['property'][0]['type']='res';
        $param['property'][0]['text']=$c->id();
        //$param['sort_by']="jdc:ordreCrible";     
        $concepts = $api->search('items',$param)->getContent();
        foreach ($concepts as $cpt) {
            //TODO: rendre accessible la propriété concepts qui disparait lors du json encode
            //$c->concepts[]=$cpt;
            $cpts[] = $cpt;
        }
        $result=['domaine'=>$d,'item'=>$c,'concepts'=>$cpts];
        $view->headScript()->appendScript('const crible = '.json_encode($result).';
            
            const user = '.$jsUser.';
            const urlSendRapports = "ajax?type=savePosi&idRt='.$rt->id().'";            
        ');

    }             

}
