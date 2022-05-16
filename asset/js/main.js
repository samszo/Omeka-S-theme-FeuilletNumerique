let width, height, mdPatienter;
//const geo = new Geo();

function initQuestion() {

    let container = d3.select(".blocks").style('background-color', 'black');
    width = container.node().clientWidth;
    height = 800;
    mdPatienter = new modalPatienter();
    let conteneur = d3.select("#cartoSonar");
    conteneur.select('svg').remove();
    conteneur.html('').style('display', 'block');
    //ajoute l'avancement du processus
    //let avancements = new avancementProcess({'cont':"#cartoSonar",'data':dataProcess});


    //ajoute les boutons de navigation dans les questions
    conteneur.append('div').attr('aria-label', 'Déroulé des questions').attr('class', 'btn-group').attr('role', 'group')
        .selectAll('button').data(questionNavig).enter().append('button')
        .attr('class', d => 'btn ' + d.class + ' ms-3 mt-2')
        .attr('type', 'button')
        .text(d => d.label)
        .on('click', (e, d) => {
            window.location.href = d.url
        });
    //ajoute le titre du domaine et de la question
    conteneur.append('h3').attr('class', 'titreQuestion').text(crible.domaine['o:title']);
    conteneur.append('h4').attr('class', 'titreQuestion').text(crible.item['skos:prefLabel'][0]['@value']);

}

function getCartoSonar() {

    if (!crible) return;
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
        return {
            'label': d['o:title'],
            'id': d['o:id'],
            'idP': crible.item['o:title'],
            'labelP': crible.item['o:id']
        };
    });
    //ajoute la carto axe            
    oCartoaxes = new cartoaxes({
        'idSvg': 'svgGlobal',
        'tick': 0,
        'idDoc': crible.item['o:id'],
        'hasRatingSystem': crible.item['o:id'],
        'crible': lstItemCrible,
        'fctGetGrad': oPolarclock.getInstantColors,
        'fctSavePosi': savePosi,
        'width': width,
        'height': height,
        'urlData':urlGetRapports
    });

}

function savePosi(d) {
    console.log(d);
    mdPatienter.show();
    //geo.getPosition(function (coords) {
        let coords = {'latitude':0,'longitude':0};
        let flux = crible.item['jdc:hasCribleCarto'][0]['display_title'] + ' : ' + crible.domaine['o:title']
        d.idCarto = crible.item['jdc:hasCribleCarto'][0]['value_resource_id'];
        d.idCrible = crible.item['o:id'];
        let omk = {
            'dcterms:title': flux + ' - ' + crible.item['o:id'] + ' : ' + actant['name'] + ' - ' + d.degrad.date,
            'dcterms:isReferencedBy': crible.domaine['o:id'] + '_' + d.idCarto + '_' + d.idCrible + ' : ' + d.degrad.date + ' : ' + actant['o:id'],
            'jdc:creationDate': d.degrad.date,
            'ma:hasCreator': [{
                'type': 'resource',
                'value': actant['o:id']
            }],
            'jdc:hasActant': [{
                'type': 'resource',
                'value': actant['o:id']
            }],
            'ma:hasRating': [],
            'ma:isRatingOf': [],
            'ma:ratingScaleMax': oCartoaxes.xMax,
            'ma:ratingScaleMin': oCartoaxes.xMin,
            'ma:hasRatingSystem': [{
                'type': 'resource',
                'value': d.idCrible
            }],
            'ma:locationLatitude': coords.latitude,
            'ma:locationLongitude': coords.longitude,
            'oa:hasSource': [{
                'type': 'resource',
                'value': d.id
            }],
            'jdc:degradName': d.degrad.nom,
            'jdc:degradColors': d.degrad.colors,
            'jdc:hasDoc': [{
                'type': 'resource',
                'value': d.id
            }],
            'jdc:distanceCenter': d.distance,
            'jdc:hasConcept': [],
            'jdc:distanceConcept': [],
            'jdc:x': d.x,
            'jdc:y': d.y,
            'jdc:xRatingValue': d.numX,
            'jdc:yRatingValue': d.numY
        }
        d.crible.forEach(function (c) {
            omk['ma:hasRating'].push(c.p);
            omk['ma:isRatingOf'].push({
                'type': 'resource',
                'value': c.t.id
            });
            omk['jdc:hasConcept'].push({
                'type': 'resource',
                'value': c.t.id
            });
            omk['jdc:distanceConcept'].push(c.p);
        })
        //message pour patienter
        d3.select('#modWaitLbl').text("Merci de patienter...");
        d3.select('#waitError').style('display', 'none');
        d3.select('#waitFermer').style('display', 'none');
        d3.select('#waitloader').style('display', 'block');
        $('#modWait').modal('show');

        $.ajax({
                type: 'POST',
                dataType: 'json',
                url: urlSendRapports,
                data: {
                    'id': crible.item['o:id'],
                    'rt': crible.rt['o:label'],
                    'rapports': omk
                }
            }).done(function (data) {
                oCartoaxes.drawPosi(data);
                $('#modWait').modal('hide');
            })
            .fail(function (e) {
                //throw new Error("Sauvegarde imposible : " + e);
                d3.select('#modWaitLbl').text("Sauvegarde imposible");
                d3.select('#waitError').style('display', 'block').html(e.responseText);
                d3.select('#waitFermer').style('display', 'block');
                d3.select('#waitloader').style('display', 'none');
            })
            .always(function(){
                mdPatienter.close();
            });
    //});
}