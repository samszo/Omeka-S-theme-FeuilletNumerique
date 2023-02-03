/*!
 * boxplot v0.0.1 
 * Copyright 2023 Samuel Szoniecky
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * merci beaucoup à d3-graph-gallery.com 
 */
class boxplot {
    constructor(params) {
        var me = this;
        this.titre = params.titre ? params.titre : 'Boxplot';
        this.data = params.data ? params.data : false;
        this.urlData = params.urlData ? params.urlData : false;
        this.group = params.group ? params.group : 'theme';
        this.mesure = params.mesure ? params.mesure : 'c';
        this.pops = params.pops ? params.pops : false;
        this.cont = params.cont ? params.cont : d3.select('body');
        this.width = params.width ? params.width : 460;
        this.height = params.height ? params.height : 400;
        this.margin = params.margin ? params.margin : {top: 10, right: 30, bottom: 40, left: 40};
        this.svg;
        this.init = function () {
            // set the dimensions and margins of the graph
            me.width -= me.margin.left - me.margin.right,
            me.height -= me.margin.top - me.margin.bottom;

            // append the svg object to the body of the page
            me.cont.select('svg').remove();
            me.svg = me.cont
                .append("svg")
                    .attr("width", me.width + me.margin.left + me.margin.right)
                    .attr("height", me.height + me.margin.top + me.margin.bottom)
                    .style('background-color','white')
                .append("g")
                    .attr("transform",
                        "translate(" + me.margin.left + "," + me.margin.top + ")");

            if(me.data){
                createGraph();
            }else{
                // Read the data and compute summary statistics for each specie
                d3.csv(me.urlData).then(data=>{
                    me.data = data;
                    createGraph();
                });
            }
        }
        function getDataSumStat(data,p=null){
            let groupData = Array.from(d3.group(data, d => d[me.group]).entries()),
            keys = [],
            sumstat = [];
            groupData.forEach(gd=>{
                keys.push(gd[0]);
                sumstat.push({'key':gd[0],'value':getSumStat(gd[1]),'p':p});
            });
            return {'k':keys,'s':sumstat};
        }
        function createGraph(){
                //calcul les données globales
                let sumstat = getDataSumStat(me.data),
                    yMinMax =[d3.min(sumstat.s.map(s=>s.value.min)),d3.max(sumstat.s.map(s=>s.value.max))];
                //calcul les données pour chaque populations
                if(me.pops){
                    me.pops.forEach(p=>{
                        p.sumstat = getDataSumStat(me.data.filter(d=>d[p.k]==p.id),p);
                    })
                }

                // Show the X scale
                let x = d3.scaleBand()
                    .range([ 0, me.width ])
                    .domain(sumstat.k)
                    .paddingInner(1)
                    .paddingOuter(.5),
                    boxWidth = x.step()-12,
                gAxe=me.svg.append("g")
                    .attr("transform", "translate(0," + me.height + ")")
                    .call(d3.axisBottom(x));            
                gAxe.selectAll('text').call(wrap,boxWidth)            

                // Show the Y scale
                var y = d3.scaleLinear()
                    .domain(yMinMax)
                    .range([me.height, 0])
                me.svg.append("g").call(d3.axisLeft(y))

                // Show the main vertical line
                me.svg
                    .selectAll("vertLines")
                    .data(sumstat.s)
                    .enter()
                    .append("line")
                    .attr("x1", d=>x(d.key))
                    .attr("x2", d=>x(d.key))
                    .attr("y1", d=>y(d.value.min))
                    .attr("y2", d=>y(d.value.max))
                    .attr("stroke", "#4d4848c9")
                    .style("width", 40)

                // rectangle for the main box
                me.svg
                    .selectAll("boxes")
                    .data(sumstat.s)
                    .enter()
                    .append("rect")
                        .attr("x", d=>x(d.key)-boxWidth/2)
                        .attr("y", d=>y(d.value.q3))
                        .attr("height", d=>y(d.value.q1)-y(d.value.q3))
                        .attr("width", boxWidth )
                        .attr("stroke", "#4d4848c9")
                        .style("fill", "none")
                // Show the median
                me.svg
                    .selectAll("medianLines")
                    .data(sumstat.s)
                    .enter()
                    .append("line")
                    .attr("x1", d=>x(d.key)-boxWidth/2)
                    .attr("x2", d=>x(d.key)+boxWidth/2)
                    .attr("y1", d=>y(d.value.median))
                    .attr("y2", d=>y(d.value.median))
                    .attr("stroke", "#4d4848c9")
                    .style("width", 80)

                //pour chaque population
                let popBand = d3.scaleBand()
                    .domain(me.pops.map(p=>p.id))
                    .range([ 0, boxWidth]),
                gPops =  me.svg
                    .selectAll(".popBoxes")
                    .data(me.pops).enter().append("g")
                    .attr('class',"popBoxes").attr('id',p=>p.k+p.id);

                // Show the main vertical line
                gPops
                    .selectAll("vertLines")
                    .data(p=>p.sumstat.s)
                    .enter()
                    .append("line")
                    .attr('class','vertLines')
                    .attr("x1", d=>x(d.key)-(boxWidth/2)+popBand(d.p.id)+(boxWidth/me.pops.length/2))
                    .attr("x2", d=>x(d.key)-(boxWidth/2)+popBand(d.p.id)+(boxWidth/me.pops.length/2))
                    .attr("y1", d=>y(d.value.min))
                    .attr("y2", d=>y(d.value.max))
                    .attr("stroke", d=>d.p.c)
                    .style("width", 40)

                //show the rectangle
                gPops.selectAll("rect")
                .data(p=>p.sumstat.s)
                .enter().append("rect")
                    .attr("x", d=>x(d.key)-(boxWidth/2)+popBand(d.p.id))
                    .attr("y", d=>y(d.value.q3))
                    .attr("height", d=>y(d.value.q1)-y(d.value.q3))
                    .attr("width", boxWidth/me.pops.length)
                    .attr("stroke", d=>d.p.c)
                    .style("fill", 'none')

                // Show the median
                gPops
                    .selectAll("medianLines")
                    .data(p=>p.sumstat.s)
                    .enter()
                    .append("line")
                    .attr('class','medianLines')
                    .attr("x1", d=>x(d.key)-(boxWidth/2)+popBand(d.p.id))
                    .attr("x2", d=>x(d.key)-(boxWidth/2)+popBand(d.p.id)+boxWidth/me.pops.length)
                    .attr("y1", d=>y(d.value.median))
                    .attr("y2", d=>y(d.value.median))
                    .attr("stroke", d=>d.p.c)

        }

        function getSumStat(d){
            // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.

            let q1 = d3.quantile(d.map(function(g) { return g[me.mesure];}).sort(d3.ascending),.25)
            , median = d3.quantile(d.map(function(g) { return g[me.mesure];}).sort(d3.ascending),.5)
            , q3 = d3.quantile(d.map(function(g) { return g[me.mesure];}).sort(d3.ascending),.75)
            , interQuantileRange = q3 - q1
            , min = q1 - 1.5 * interQuantileRange
            , max = q3 + 1.5 * interQuantileRange;
            return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
        }
    

        this.init();
    }
}