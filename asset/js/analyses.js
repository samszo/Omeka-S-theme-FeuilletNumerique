let actants, colR, ntStatsNav, ntStatsContent, color;
function getResultAnalyses(){
    console.log(analyses);
    if(analyses.urlData){
        d3.json(analyses.urlData).then(data=>{
            analyses = data;
            setLayout();  
        })
    }else setLayout();
}

function setLayout(){
    //création du layout
    let blocks = d3.select('#resultAnalyses'),
    cont = blocks.append('div').attr('class','container').append('div').attr('class','row'),
    colL = cont.append('div').attr('class','col-4');      
    colR = cont.append('div').attr('class','col-8');
    color = d3.scaleSequential(d3.interpolateWarm)
    .domain([0, analyses.actants.length-1]),

    //création du filtre pour les actants   
    actants = colL.append('div').attr('id','actants');
    actants.append('h3').text('Actants');
    let sltActants = actants.selectAll('div').data(analyses.actants).enter().append('div')
        .attr('class',"mb-3 form-check form-switch");
    sltActants.append('input').attr('class',"form-check-input").attr('type',"checkbox").attr('id',a=>"switch"+a["o:id"]).attr('checked',1)
        .on('click',(e,a)=>showStat(null,null));
    sltActants.append('label')
        .attr('class',"form-check-label").attr('for',a=>"switch"+a["o:id"]).text(a=>a["o:title"])
        .style('background-color',(a,i)=>color(i))
        .style('color','white')
        .style('padding','4px');
    
    //création des rendus statistiques
    let stats=['Theme','Concept','Question','Position'], tabStats = `<div class="bd-stats">
        <nav>
          <div class="nav nav-tabs mb-3" id="ntStats" role="tablist">
          </div>
        </nav>
        <div class="tab-content" id="ntStatsContent">
        </div>
    </div>`;
    colR.html(tabStats);
    ntStatsNav = colR.select('#ntStats').selectAll('a').data(stats).enter().append('a')
        .attr('class',(s,i)=>i==0 ? "nav-link active":"nav-link")
        .attr('id',(s,i)=>"ntStats"+s)
        .attr('data-bs-toggle',"tab")
        .attr('href',(s,i)=>"#nav"+s)
        .attr('role',"tab")
        .attr('aria-controls',(s,i)=>"nav"+s)
        .attr('aria-selected',(s,i)=>i==0 ? 'true':'false').html(s=>s)
        .on('click',showStat);
    ntStatsContent = colR.select('#ntStatsContent');
    let divGraphDim = ntStatsContent.node().getBoundingClientRect(),
    footerDim = d3.select('footer').node().getBoundingClientRect();
    ntStatsContent.selectAll('div').data(stats).enter().append('div')
        .attr('class',(s,i)=>i==0 ? "tab-pane fade active show":"tab-pane fade")
        .style('overflow-y','scroll')
        .style('height',(footerDim.top-divGraphDim.top)+'px')
        .attr('id',(s,i)=>"nav"+s)
        .attr('role',"tabpanel")
        .attr('aria-labelledby',(s,i)=>"ntStats"+s);
    showStat(null,null);
}
function showStat(cont,group){
    //calcul la taille du graphe
    let divGraphDim = ntStatsContent.node().getBoundingClientRect(),
        w=divGraphDim.width-100,h=divGraphDim.height-100;

    //récupère le group sélectionné
    if(group==null){
        ntStatsNav.each(s=>{
            if(colR.select("#ntStats"+s).attr('aria-selected')=='true')group=s;
        })    
    }
    //récupère les actants sélectionné
    let sltActant = [];
    actants.selectAll('input').each((a,i)=>{
        let n = actants.select('#switch'+a["o:id"]);
        if(n.node().checked)sltActant.push({'k':'idActant','id':a['o:id'],'c':color(i),'titre':a['o:title']});
    })    
    //filtre les data
    let posis = analyses.posis.filter(p=>sltActant.filter(a=>a.id==p[a.k]).length);
    //construction du graph à moustache
    //suivant la stat
    switch (group) {
        case 'Theme':
            showTheme(posis, group, w, h, sltActant);
            break;
        case 'Question':
            showStatQuestion(posis,group,sltActant,w,h);
            break;
        case 'Concept':
            showTagCloud(posis,group,w+80,h+80);
            break;
        case 'Position':
            showPosition(posis,group,w,h,sltActant);
            break;
        }
}

function showTheme(posis, group, w, h, actants){
    let divCont = ntStatsContent.select('#nav'+group);
    divCont.selectAll('div').remove();
    let divBarStack = divCont.append('div').attr('id','barstack'+group),
        divBoxPlot = divCont.append('div').attr('id','boxplot'+group),
        tap = [], zDomain=[], colors=[];
    actants.forEach(a => {
        zDomain.push(a.titre);
        colors.push(a.c);
        analyses.themes.forEach(t=>{
            tap.push({'titreActant':a.titre,'titreTheme':t['o:title']
                , 'nbPosi':posis.filter(p => p['idActant'] == a.id && p['idTheme'] == t['o:id']).length
            });    
        })
    });
    let sb = new stackbar({'cont':divBarStack,'data':tap
        ,'pX':'titre'+group, 'pY':'nbPosi', 'pZ':'titreActant'
        ,'yLabel':'Nombre de position pour un actant','zDomain':zDomain
        , 'width':w,'height':h, colors:colors
        }),                
    bp = new boxplot({'cont':divBoxPlot,'data':posis
        ,'group':'titre'+group, 'mesure':'poids'
        ,'pops':actants, 'width':w,'height':h
        });                    
}

function showPosition(posis, group, w, h, actants){

    let cont = ntStatsContent.select('#nav'+group);
    cont.selectAll('div').remove();
    //création des questions
    let questions = Array.from(d3.group(posis, d => d['titreQuestion']).keys()).sort(),
    idActants = actants.map(a=>a.id), 
    q = cont.selectAll('div').data(questions).enter().append('div');
    q.append('h5').style('margin-top','6px').html(p=>p);
    q.append('div').attr('id',(p,i)=>'graph'+group+i);
    
    questions.forEach((q,i)=>{
        //filtre les réponses
        let reponses = analyses.sp.filter(s=>
            idActants.includes(s['jdc:hasActant'][0]['value_resource_id'])
            &&
            s['jdc:hasDoc'][0]['display_title']==q
            ),
        crible = analyses.cribles.filter(c=>c.item["o:id"]==reponses[0]['jdc:hasDoc'][0]['value_resource_id']);
        //ajoute la couleur de la position
        reponses.forEach(r=>{
            let a = actants.filter(a=>a.id==r['jdc:hasActant'][0]['value_resource_id']),
            c = d3.color(a[0].c)
            r.color=c.copy({opacity: 0.5});
        })
        getCartoSonar(reponses,crible[0],'graph'+group+i, w, h,false,showPosiInfos);    
    });    
}
function showPosiInfos(e,d){
    console.log(d);
    let p = analyses.posis.filter(p=>p.idPosition==d["o:id"]);
    console.log(p);
}
function showTagCloud(posis, group, w, h){
    let tc = new tagcloud({'cont':ntStatsContent.select('#nav'+group), data:posis 
        , 'width':w,'height':h
        , global:true, kText:'titreConcept', kVal:'poids'});

}

function showStatQuestion(posis,group,pops,w,h){
    let cont = ntStatsContent.select('#nav'+group);
    cont.selectAll('div').remove();
    let groupData = d3.group(posis, d => d['titre'+group]),
    q = cont.selectAll('div').data(Array.from(groupData.keys()).sort()).enter().append('div');
    q.append('h5').style('margin-top','6px').html(p=>p);
    q.append('div').attr('id',(p,i)=>'graph'+group+i);
    Array.from(groupData.entries()).forEach((e,i)=>{
        new boxplot({'cont':ntStatsContent.select('#graph'+group+i),'data':e[1],'group':'titreConcept'
        ,'mesure':'poids','pops':pops, 'width':w,'height':h
        });                
    });    
}