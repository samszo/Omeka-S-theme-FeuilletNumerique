/**
 * 
 * 
 * merci à http://www.jasondavies.com/wordcloud/
 */
class tagcloud {
    constructor(params) {
        var me = this;	var me = this;
		this.cont = params.cont ? params.cont : d3.select('body');
        this.width = params.width ? params.width : 640;
        this.height = params.height ? params.height : 128;
        this.color = params.color ? params.color : d3.scaleSequential(d3.interpolateWarm);
        this.colorTag = params.colorTag ? params.colorTag : 'black';
		this.idDoc = params.idDoc ? params.idDoc : false;  
		this.kText = params.kText ? params.kText : false;  
		this.kVal = params.kVal ? params.kVal : false;  
		this.idExi = params.idExi; 
		this.sauve = params.sauve; 
		this.exi = params.exi ? params.exi : false;
		this.global = params.global;  
		this.txt = params.txt;  
		this.data = params.data;
		this.term = params.term;
		this.utiWords = params.utiWords;
		this.poidsTag = 1;
		this.urlJson = params.urlJson;
		this.div = params.div;
		this.tags = [];
		// From 
		// Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
		// 
		this.stopWords = /^(estce|vousmême|puisqu|estàdire|très|cela|alors|donc|etc|for|tant|au|en|un|une|aux|et|mais|par|c|d|du|des|pour|il|ici|lui|ses|sa|son|je|j|l|m|me|moi|mes|ma|mon|n|ne|pas|de|sur|on|se|soi|notre|nos|qu|s|même|elle|t|que|celà|la|le|les|te|toi|leur|leurs|eux|y|ces|ils|ce|ceci|cet|cette|tu|ta|ton|tes|à|nous|ou|quel|quels|quelle|quelles|qui|avec|dans|sans|vous|votre|vos|été|étée|étées|étés|étant|suis|es|est|sommes|êtes|sont|serai|seras|sera|serons|serez|seront|serais|serait|serions|seriez|seraient|étais|était|étions|étiez|étaient|fus|fut|fûmes|fûtes|furent|sois|soit|soyons|soyez|soient|fusse|fusses|fût|fussions|fussiez|fussent|ayant|eu|eue|eues|eus|ai|as|avons|avez|ont|aurai|auras|aura|aurons|aurez|auront|aurais|aurait|aurions|auriez|auraient|avais|avait|avions|aviez|avaient|eut|eûmes|eûtes|eurent|aie|aies|ait|ayons|ayez|aient|eusse|eusses|eût|eussions|eussiez|eussent|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;
		this.punctuation = /["“"!()&*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g;
		this.elision = /[’'’0123456789]+/g;
		this.wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;
	
		var hpt,
		complete = 0,
		statusText = d3.select("#status_"+this.idDoc),
		maxLength = 30,
		maxTag = 1000, 
		minmaxFont = [8, 96],
		posiTxt = d3.select("#select_txt_"+this.idDoc),
		max, svg, background, vis, tooltip,ext,fontSize;
		

		this.init = function() {
									
			if(posiTxt){
				hpt  = posiTxt.clientHeight;
				if(hpt>me.height)me.height=hpt;
			}

			if(this.urlJson){
				d3.json(me.urlJson).then(donnes=>{
					me.data = donnes;
					setTG();
				});
			}else{
				setTG();
			}
		}
	    
		function setTG() {

		    if(me.data){
		    	me.tags = parseData();
		    }
		    if(me.txt){
		    	me.tags=parseText();
		    	//hypertextualise seulement les sélections des utilisateurs
		    	if(me.exi){
			    	hypertextualise();	    		
		    	}
		    	posiTxt.innerHTML = me.txt;
		    }
		    console.log('tags',me.tags);
			max = me.tags.length;
			
			me.cont.select('svg').remove();
			me.cont.selectAll('div').remove();
			
			svg = me.cont.append("svg")
				.attr("id", "svg_"+me.idDoc)
				.attr("width", me.width)
				.attr("height", me.height);
			background = svg.append("g");
			vis = svg.append("g")
					.attr("transform", "translate(" + [me.width >> 1, me.height >> 1] + ")"); 

			tooltip = me.cont
			    .append("div")
			    .attr("class", "term")
			    .style("position", "absolute")
			    .style("z-index", "10")
			    .style("visibility", "hidden")
			    .style("font","32px sans-serif")
			    .style("background-color","white")		    
			    .text("a simple tooltip");
			
			ext = d3.extent(me.tags.map(function(x) { return parseInt(x.value); }));
			fontSize = d3.scaleLog().domain([ext[0],ext[1]]).range(minmaxFont);
			d3.layout.cloud().size([me.width, me.height])
				.words(me.tags)
			    .rotate(0)
			    .spiral("rectangular")
			    .fontSize(function(d) {
			    	var n = d.value*16;
			    	if(me.exi){
			    		var uw = inUtiWords(d.tag);
			    		if(uw) n = uw.value*8;
			    	}
			    	if(me.global)n=fontSize(d.value);
			    	if(n>me.height)n=me.height/2;
			    	return n; 
			    	})
				.text(function(d) { 
					return d.tag; 
					})
			    .on("word", progress)
			    .on("end", draw)
			    .start();			
		}
	    

		    	
		function draw(words) {
			var text = vis.selectAll("text")
		        .data(words)
			    .enter().append("text")
		    	  	//.style("fill", function(d) { return fill(d.text.toLowerCase()); })
		    	  	.style("fill", function(d) {
		    	  		if(me.exi && inUtiWords(d.text))
		    	  			return "steelblue"; 
		    	  		if(me.term && me.term.indexOf(d.text)>0)
		    	  			return "blue";
		    	  		else
		    	  			return me.colorTag;
		    	  	})
		        	.style("font-size", function(d) { 
		        		return d.size + "px"; 
		        		})
			        .attr("text-anchor", "middle")
		    	    .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
		        	.text(function(d) { return d.text; })
		        	.on("click", function(d) {
		        		var mt = d3.select(this);
		        		if(me.global){
		        			vis.selectAll("text").style("fill","black");
		        			d3.select(this).style("fill","blue");
		        			chargeTag(d);	
		        		}
		        		if(me.exi || me.sauve){
							console.log(me.idDoc+" "+d.text+" "+me.poidsTag);
							saveTag(d.text, me.poidsTag, "tag_"+me.idDoc);
		        		} 
		        	})
		        	.on("mouseover", function(d, i) { 
		        		if(me.exi){
		        			var c;
		        			if(me.poidsTag<1)c="yellow"; else c="red";
		        			d3.select(this).style("fill", c);
		        		}
		        		if(me.global) 
		        			return tooltip.style("visibility", "visible");		        		
		        		})
		        	.on("mouseout", function(d, i) { 
		        		if(me.exi) d3.select(this).style("fill", "black");
		        		if(me.global) return tooltip.style("visibility", "hidden");
		        		})
	    	        .on("mousemove", function(d, i){
	    	        	if(me.global) return tooltip
			        		.style("top", (event.pageY+10)+"px")
			        		.style("left",(event.pageX+10)+"px")
	    	        		.text(d.text);
	    	        	})
		        	.attr("cursor", function() { if(me.exi || me.global) return "pointer";})
		        	;
		}
		function progress(d) {
			statusText.text(++complete + "/" + max);
		}
				
		function parseText(txt=false) {
			let tags = [], doublons=[];
			var txt = txt ? txt : me.txt;
			txt.split(me.wordSeparators).forEach(word=> {
				var j = word.search("&quot;");
				if(j==0){
					word = word.substr(6);
				}else if(j>0){
					word = word.substr(0, j);
				}
				var i = word.search(me.elision);
				if(i>0)word = word.substr(i+1);
				word = word.replace(me.punctuation, "");
				if (me.stopWords.test(word.toLowerCase())) return;
				if (word.length <= 2) return;
		    	if(me.exi){
		    		var uw = inUtiWords(word);
		    		if(uw.value<0) return;
		    	}				
				word = word.substr(0, maxLength).toLowerCase();
				if(doublons[word])tags[doublons[word]].value++;
				else{
					tags.push({'tag':word,'value':1});
					doublons[word]=tags.length-1;
				}
			});
			return tags;
		}

		function parseData() {
			let tags = [],i;
			me.data.forEach(d=> {
				var wt = parseText(d[me.kText]);
				wt.forEach(t=>{
					i = tags.findIndex(mt => mt.tag == t.tag);
					if(i>=0)tags[i].value+=t.value;
					else tags.push(t);
				});
			});
			return tags;
		}
		
		function inUtiWords(txt) {
			 for(var i= 0; i < me.utiWords.length; i++)
			 {
				 if(txt.toLowerCase()==me.utiWords[i]['code']){
					 return me.utiWords[i];					 
				 } 
			 }
			 return false;
		}
		function hypertextualise() {
			 var d, reg, str;
			 for(var i= 0; i < me.data.length; i++)
			 {
				 d = me.data[i];
				 reg=new RegExp("("+d.tag+")", "g");
				 str = "<span id='tag_"+me.idDoc+"' class='tag' v='"+d[me.kVal]+"'>$1</span>";
				 me.txt =  me.txt.replace(reg, str);
			 }
		}

        this.init();
    }
}