<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for getting data to build nagigation between questions.
 */
class getQuestionNavig extends AbstractHelper
{
    /**
     * 
     * @param o:item   $crible item du crible

     */
    public function __invoke($crible)
    {
        $view = $this->getView();
        $api = $view->api();
        
        //récupère les questions du domaine
        $d = $crible->value('skos:broader')->valueResource();
        $questions = $api->search('items', ['item_set_id' => $d->id(),'sort_by'=>"jdc:ordreCrible"])->getContent();
        //construction de la barre de navigation
        $navig = [];
        foreach ($questions as $i => $q) {
            if($q->id()==$crible->id()){
                if($i > 0){
                    $pq = $questions[$i-1];
                    $navig[]=['label'=>'Question précédente','url'=>'repondre-question?id='.$pq->id(), 'id'=>$pq->id(), 'class'=>'btn-warning'];
                }
                if($i+1 < count($questions)){
                    $nq = $questions[$i+1];
                    $navig[]=['label'=>'Question suivante','url'=>'repondre-question?id='.$nq->id(), 'id'=>$nq->id(), 'class'=>'btn-success'];
                }
            }            
        }
        $navig[]=['label'=>'Changer de domaine', 'url'=>'repondre-enquete', 'class'=>'btn-light'];
        $navig[]=['label'=>"Finaliser l'enquête", 'url'=>'fin-enquete', 'class'=>'btn-danger'];

        $view->headScript()->appendScript('const questionNavig = '.json_encode($navig).';');

    }             

}
