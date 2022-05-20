function setTableQuestions(){
    let tq = d3.select('#tableQuestions');
    if(tq.size()){
        console.log('tableQuestions');
        tq.html('');

        var treeData =
        {
          "name": "Domaine d'exploration",
          "children": [
            { 
              "name": "Médiation culturelle",
              "children": [
                { "name": "Son of A" ,
                "children": [
                  { 
                    "name": "Médiation culturelle",
                    "children": [
                      { "name": "Son of A" ,
                      "children": [
                        { 
                          "name": "Médiation culturelle",
                          "children": [
                            { "name": "Son of A"  ,
                            "children": [
                              { 
                                "name": "Médiation culturelle",
                                "children": [
                                  { "name": "Son of A" }
                                ]
                              }
                            ]}
                          ]
                        }
                      ]}
                    ]
                  }
                ]}
              ]
            },
            { "name": "Dispositif numérique" ,
            "children": [
                { "name": "Son of A" ,
                "children": [
                  { 
                    "name": "Médiation culturelle",
                    "children": [
                      { "name": "Son of A" ,
                      "children": [
                        { 
                          "name": "Médiation culturelle",
                          "children": [
                            { "name": "Son of A"  ,
                            "children": [
                              { 
                                "name": "Médiation culturelle",
                                "children": [
                                  { "name": "Son of A" }
                                ]
                              }
                            ]}
                          ]
                        }
                      ]}
                    ]
                  }
                ]}
            ]},
            { "name": "Technique et connaissances numériques" ,
            "children": [
                { "name": "Son of A" ,
                "children": [
                  { 
                    "name": "Médiation culturelle",
                    "children": [
                      { "name": "Son of A" ,
                      "children": [
                        { 
                          "name": "Médiation culturelle",
                          "children": [
                            { "name": "Son of A"  ,
                            "children": [
                              { 
                                "name": "Médiation culturelle",
                                "children": [
                                  { "name": "Son of A" }
                                ]
                              }
                            ]}
                          ]
                        }
                      ]}
                    ]
                  }
                ]}
              ]
            },
          ]
        };
      
      // set the dimensions and margins of the diagram
      let mainDivSize = tq.node().getBoundingClientRect(),
        rectNode = { width : 160, height : 48, textMargin : 5 };
      var margin = {top: 40, right: 90, bottom: 50, left: 90},
          width = mainDivSize.width - margin.left - margin.right,
          height = 2000 - margin.top - margin.bottom;
      
      // declares a tree layout and assigns the size
      var treemap = d3.tree()
          .size([width, height]);
      
      //  assigns the data to a hierarchy using parent-child relationships
      var nodes = d3.hierarchy(dataQuestions);
      
      // maps the node data to the tree layout
      nodes = treemap(nodes);
      
      // append the svg obgect to the body of the page
      // appends a 'group' element to 'svg'
      // moves the 'group' element to the top left margin
      var svg = tq.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom),
          g = svg.append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
      
      // adds the links between the nodes
      var link = g.selectAll(".link")
          .data( nodes.descendants().slice(1))
        .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
             return "M" + d.x + "," + d.y
               + "C" + d.x + "," + (d.y + d.parent.y) / 2
               + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
               + " " + d.parent.x + "," + d.parent.y;
             });
      
      // adds each node as a group
      var node = g.selectAll(".node")
          .data(nodes.descendants())
        .enter().append("g")
          .attr("class", function(d) { 
            return "node" + 
              (d.children ? " node--internal" : " node--leaf"); })
          .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; })
          .style('cursor',d=>d.depth>1 ? 'pointer' : 'none')
          .on('click',(e,d)=>{
              if(d.depth>1)window.location.href="repondre-question?id="+d.data.id
            });
      
      /* adds the circle to the node
      node.append("circle")
        .attr("r", 10);
      */
      node.append('rect')
		.attr('rx', 6)
		.attr('ry', 6)
		.attr('x', -rectNode.width/2)
		.attr('y', -rectNode.height/2)
		.attr('width', rectNode.width)
		.attr('height', rectNode.height)
		.attr('class', 'node-rect')
		.attr('fill', d=>d.depth > 1 ? 'white' : '#a9b2b8');

      /* adds the text to the node
      node.append("text")
        .attr("dy", ".35em")
        .attr("y", function(d) { return d.children ? -20 : 20; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.name; });
        */
      node.append('foreignObject')
		.attr('x', rectNode.textMargin-rectNode.width/2)
		.attr('y', rectNode.textMargin-rectNode.height/2)
		.attr('width', function() {
					return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0
							: (rectNode.width - rectNode.textMargin * 2)
				})
		.attr('height', function() {
					return (rectNode.height - rectNode.textMargin * 2) < 0 ? 0
							: (rectNode.height - rectNode.textMargin * 2)
				})
		.append('xhtml').html(function(d) {
					return '<div style="width: '
							+ (rectNode.width - rectNode.textMargin * 2) + 'px; height: '
							+ (rectNode.height - rectNode.textMargin * 2) + 'px;" class="node-text wordwrap">'
							+ '<b>' + d.data.name + '</b>'
							+ '</div>';
				})       

    }    
}
