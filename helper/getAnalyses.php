<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for getting data to build sonar cartographie.
 */
class getAnalyses extends AbstractHelper
{
    /**
     * 
     */
    public function __invoke($cache=true, $json=false)
    {
        $view = $this->getView();
        $user = $view->identity();
        if(!$user){
            $user=$view->CartoAffectFactory(['getActantAnonyme'=>true]); 
            $jsUser = json_encode(['name'=>$user->name(),'email'=>$user->email(),'id'=>$user->id(),'role'=>$user->role()]);
        }else{
            $jsUser = json_encode(['name'=>$user->getName(),'email'=>$user->getEmail(),'id'=>$user->getId(),'role'=>$user->getRole()]);
        }
        if(!$cache){
            $api = $view->api();
            
            //récupère toutes les positions sémantiques
            $ps = $api->search('items', ['resource_class_id' => '173'])->getContent();
            //regroupe les infos
            $actants=[];
            $themes=[];
            $concepts=[];
            $cribles=[];
            $posis=[];
            $doublons=[];
            foreach ($ps as $p) {
                $a = $p->value('jdc:hasActant')->valueResource();
                if(!$doublons[$a->id()]){
                    $actants[]=$a;
                    $doublons[$a->id()]=count($actants);
                }
                $crible = $p->value('jdc:hasDoc');
                if($crible){
                    $crible = $crible->valueResource();
                    if(!$doublons[$crible->id()]){
                        $cribles[]=$crible;
                        $doublons[$crible->id()]=count($cribles);
                    }
                    $theme=$crible->value('skos:broader')->valueResource();
                    if(!$doublons[$theme->id()]){
                        $themes[]=$theme;
                        $doublons[$theme->id()]=count($themes);
                    }
                    $cpts = $p->value('jdc:hasConcept',['all'=>1]);
                    $distances = $p->value('jdc:distanceConcept',['all'=>1]);
                    $center = $p->value('jdc:distanceCenter')->__toString();
                    $valX = $p->value('jdc:xRatingValue')->__toString();
                    $valY = $p->value('jdc:yRatingValue')->__toString();
                    $date = $p->value('jdc:creationDate')->__toString();            
                    for ($i=0; $i < count($cpts); $i++) { 
                        $cpt = $cpts[$i]->valueResource();
                        if(!$doublons[$cpt->id()]){
                            $concepts[]=$cpt;
                            $doublons[$cpt->id()]=count($concepts);
                        }
                        $posis[] = [
                            'idPosition'=>$p->id(),
                            'idConcept'=>$cpt->id(),
                            'idQuestion'=>$crible->id(),
                            'idTheme'=>$theme->id(),
                            'idActant'=>$a->id(),
                            'titrePosition'=>$p->displayTitle(),
                            'titreConcept'=>$cpt->displayTitle(),
                            'titreQuestion'=>$crible->displayTitle(),
                            'titreTheme'=>$theme->displayTitle(),
                            'titreActant'=>$a->displayTitle(),                            
                            'd'=>$distances[$i]->__toString(),'c'=>$center,'x'=>$valX,'y'=>$valY,'date'=>$date
                        ];
                    }
                }else{
                    $t=1;
                }
            }            
            $result=['posis'=>$posis,'actants'=>$actants,'themes'=>$themes,'concepts'=>$concepts,'cribles'=>$cribles];
        }else{
            $result=['urlData'=>$view->assetUrl('data/analyses.json')];
        }

        if($json){
            return $result;
        }else{
            $view->headScript()->appendScript('

                var analyses = '.json_encode($result).';            
                const actant = '.$jsUser.';
            ');
        }
    }             

}
