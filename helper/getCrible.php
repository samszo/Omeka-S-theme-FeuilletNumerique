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
     * @param o:item   $crible item du crible

     */
    public function __invoke($crible)
    {
        $view = $this->getView();
        $api = $view->api();
        $user = $view->identity();
        if(!$user){
            $user=$view->CartoAffectFactory(['getActantAnonyme'=>true]); 
            $jsUser = json_encode(['name'=>$user->name(),'email'=>$user->email(),'id'=>$user->id(),'role'=>$user->role()]);
        }else{
            $jsUser = json_encode(['name'=>$user->getName(),'email'=>$user->getEmail(),'id'=>$user->getId(),'role'=>$user->getRole()]);
        }
        
        //récupère la définition du crible
        $inScheme = $api->search('properties', ['term' => 'skos:inScheme'])->getContent()[0];
        $rt = $api->search('resource_templates', ['label'=>'Position sémantique : sonar'])->getContent()[0];        
        //récupère le domaine
        $d = $crible->value('skos:broader')->valueResource();
        //récupère la liste des concepts
        $cpts = array();
        $param = array();
        $param['property'][0]['property']= $inScheme->id()."";
        $param['property'][0]['type']='res';
        $param['property'][0]['text']=$crible->id();
        //$param['sort_by']="jdc:ordreCrible";     
        $concepts = $api->search('items',$param)->getContent();
        foreach ($concepts as $cpt) {
            //TODO: rendre accessible la propriété concepts qui disparait lors du json encode
            //$c->concepts[]=$cpt;
            $cpts[] = $cpt;
        }
        $result=['domaine'=>$d,'item'=>$crible,'concepts'=>$cpts,'rt'=>$rt];
        $view->headScript()->appendScript('const crible = '.json_encode($result).';
            
            const actant = '.$jsUser.';
            const urlSendRapports = "ajax?json=1&type=savePosi";            
            const urlGetRapports = "ajax?json=1&type=getPosis&idCrible='.$crible->id().'&idDoc='.$crible->id().'";            
        ');

    }             

}
