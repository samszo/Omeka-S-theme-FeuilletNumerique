let width, height;

function initQuestion() { 
    
    let container = d3.select(".blocks").style('background-color','black');
    width = container.node().clientWidth;
    height= 800;
    let conteneur = d3.select("#cartoSonar");
    conteneur.select('svg').remove();
    conteneur.html('').style('display','block');
    //ajoute les boutons suivant précédent
    let arrBtn = ['Question précédente','Question suivante','Retour aux domaines',"Finaliser l'enquête"];
    conteneur.append('div').attr('aria-label','Déroulé des questions').attr('class','btn-group').attr('role','group')
        .selectAll('button').data(arrBtn).enter().append('button')
            .attr('class','btn btn-danger ms-3 mt-2')
            .attr('type','button')
            .text(d=>d);
    
    //ajoute le titre du domaine et de la question
    conteneur.append('h3').attr('class','titreQuestion').text(crible.domaine['o:title']);
    conteneur.append('h4').attr('class','titreQuestion').text(crible.item['o:title']);
    
}

function getCartoSonar() {

    if(!crible)return;
    initQuestion();

    //ajoute le svg global
    let svg = d3.select("#cartoSonar").append('svg');
    svg.attr("id", "svgGlobal")
            .attr("width", width)
            .attr("height", height);
    
    //supprime les anciens graphe
    svg.selectAll('g').remove();


    //ajoute la polar clock
    oPolarclock = new polarclock({
        'idSvg': 'svgGlobal',
        'spacing': 0.000001,
        'width': width,
        'height': height,
        'chrono': true,
        'nbCouche': 6
        });

    //liste des axes
    let lstItemCrible = crible.concepts.map(d => {
        return {'label':d['o:title'],'id':d['o:id'],'idP':crible.item['o:title'],'labelP':crible.item['o:id']};
    });
    //ajoute la carto axe            
    oCartoaxes = new cartoaxes({
        'idSvg': 'svgGlobal',
        'tick': 0,
        'idDoc': crible.item['o:id'],
        'hasRatingSystem':crible.item['o:id'],
        'crible': lstItemCrible,
        'fctGetGrad': oPolarclock.getInstantColors,
        'fctSavePosi': savePosi,
        'width': width,
        'height': height
        });

}

function savePosi(d){
    console.log(d);

    d.idCarto = selectCarto['o:id'];
    d.idCrible = selectCrible.item['o:id'];
let omk = {
    'dcterms:title':flux+' _ '+item['o:title']+' : '+d.degrad.date
    ,'dcterms:isReferencedBy':item['o:id']+'_'+d.idCarto+'_'+d.idCrible+' : '+d.degrad.date+' : '+actant['o:id']
    ,'jdc:creationDate':d.degrad.date
    ,'ma:hasCreator':[{'type':'resource','value':actant['o:id']}]
    ,'jdc:hasActant':[{'type':'resource','value':actant['o:id']}]
    ,'ma:hasRating':[]
    ,'ma:isRatingOf':[]
    ,'ma:ratingScaleMax':oCartoaxes.xMax
    ,'ma:ratingScaleMin':oCartoaxes.xMin
    ,'ma:hasRatingSystem':[{'type':'resource','value':d.idCrible}]
    ,'ma:locationLatitude':geo.coords.latitude
    ,'ma:locationLongitude':geo.coords.longitude
    ,'oa:hasSource':[{'type':'resource','value':d.id}]
    ,'jdc:degradName':d.degrad.nom
    ,'jdc:degradColors':d.degrad.colors
    ,'jdc:hasDoc':[{'type':'resource','value':d.id}]
    ,'jdc:distanceCenter':d.distance
    ,'jdc:hasConcept':[]
    ,'jdc:distanceConcept':[]
    ,'jdc:x':d.x
    ,'jdc:y':d.y
    ,'jdc:xRatingValue':d.numX
    ,'jdc:yRatingValue':d.numY
}
d.crible.forEach(function(c){
    omk['ma:hasRating'].push(c.p);
    omk['ma:isRatingOf'].push({'type':'resource','value':c.t.id});
    omk['jdc:hasConcept'].push({'type':'resource','value':c.t.id});
    omk['jdc:distanceConcept'].push(c.p);
})
//message pour patienter
d3.select('#modWaitLbl').text("Merci de patienter...");                
d3.select('#waitError').style('display','none');
d3.select('#waitFermer').style('display','none');
d3.select('#waitloader').style('display','block');    
$('#modWait').modal('show');

$.ajax({
    type: 'POST',
    dataType: 'json',
    url: urlSendRapports,
    data: {
            'ajax':true,
            'id': item['o:id'],
            'idRt': rtSonar,
            'rapports': omk
    }
    }).done(function(data) {
            oCartoaxes.drawPosi(data);
            $('#modWait').modal('hide');
    })
    .fail(function(e) {
            //throw new Error("Sauvegarde imposible : " + e);
            d3.select('#modWaitLbl').text("Sauvegarde imposible");                
            d3.select('#waitError').style('display','block').html(e.responseText);
            d3.select('#waitFermer').style('display','block');
            d3.select('#waitloader').style('display','none');    
             
    });

}
