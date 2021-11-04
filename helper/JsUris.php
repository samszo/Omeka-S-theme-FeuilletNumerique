<?php
namespace OmekaTheme\Helper;

use Laminas\View\Helper\AbstractHelper;

/**
 * View helper for rendering uris for JavaScript.
 */
class JsUris extends AbstractHelper
{
    /**
     * Render uri for JavaScript.
     * @param array   $props    les propriétés utiles

     */
    public function __invoke($props)
    {
        $view = $this->getView();
        $user = $view->identity();
        $jsUser = $user ? json_encode(['name'=>$user->getName(),'email'=>$user->getEmail(),'id'=>$user->getId(),'role'=>$user->getRole()]) : 'false';
        $urlAjax = $props['site']->siteUrl()."/page/ajax?json=1";
        //construction des urls pour l'autocomplete
        $urlsAutoComplete = [];
        foreach (['jdc:Physique','jdc:Actant','jdc:Concept'] as $dim) {
            $rc =  $view->api()->search('resource_classes', ['term' => $dim])->getContent()[0];
            $urlsAutoComplete[$rc->label()]=$view->basePath()."/api/items?"
            ."property[0][joiner]=and&property[0][property]=1&property[0][type]=in"
            ."&resource_class_id[]=".$rc->id()."&sort_by=created&sort_order=desc&property[0][text]=";
        }

        $view->headScript()->appendScript('const urlAjax = "'.$urlAjax.'";
            const urlsAutoComplete = '.json_encode($urlsAutoComplete).';
            
            const user = '.$jsUser.';
        ');
    }
}
