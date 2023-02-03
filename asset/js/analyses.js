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
    let stats=['Theme','Question','Concept','Position'], tabStats = `<div class="bd-stats">
        <nav>
          <div class="nav nav-tabs mb-3" id="ntStats" role="tablist">
          </div>
        </nav>
        <div class="tab-content" id="ntStatsContent">
        </div>
    </div>`,
    divActantDim = actants.node().getBoundingClientRect();
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
    ntStatsContent.selectAll('div').data(stats).enter().append('div')
        .attr('class',(s,i)=>i==0 ? "tab-pane fade active show":"tab-pane fade")
        .style('overflow-y','scroll')
        .style('height',(divActantDim.height-10)+'px')
        .attr('id',(s,i)=>"nav"+s)
        .attr('role',"tabpanel")
        .attr('aria-labelledby',(s,i)=>"ntStats"+s);
    showStat(null,'Theme');
}
function showStat(cont,group){
    //calcul la taille du graphe
    let divGraphDim = ntStatsContent.node().getBoundingClientRect(),
        w=divGraphDim.width-100,h=divGraphDim.height-140;

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
        if(n.node().checked)sltActant.push({'k':'idActant','id':a['o:id'],'c':color(i)});
    })    
    //filtre les data
    let posis = analyses.posis.filter(p=>sltActant.filter(a=>a.id==p[a.k]).length);
    //construction du graph à moustache
    //suivant la stat
    switch (group) {
        case 'Theme':
            let gm = new boxplot({'cont':ntStatsContent.select('#nav'+group),'data':posis
                ,'group':'titre'+group, 'mesure':'d'
                ,'pops':sltActant, 'width':w,'height':h
                });                
            break;
        case 'Question':
            showStatQuestion(posis,group,sltActant,w,h);
            break;
        case 'Concept':
            showTagCloud(posis,group,w,h);
            break;
        }
}

function showTagCloud(posis, group, w, h){
    let tc = new tagcloud({'cont':ntStatsContent.select('#nav'+group), data:posis 
        , 'width':w,'height':h
        , global:true, kText:'titreConcept', kVal:'d'});

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
        ,'mesure':'d','pops':pops, 'width':w,'height':h
        });                
    });    
}