Raphael.fn.pieChart = function (json) {
    var paper = this,
        rad = Math.PI / 180,
		stroke = "#fff",
        space=15,
		r=paper.height/2-space,
        cx=r+space,
        cy=cx,
        recth = (paper.height-3*space)/10;
    function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    var angle = 0,
        total = 0,
        start = 0,
        process = function (j) {
            var value = json.data[j].value,
                angleplus = 360 * value / total,
                popangle = angle + (angleplus / 2),
                color = Raphael.hsb(start, 0.5, 0.7),
                ms = 500,
                delta = 30,
                chart = paper.set(),
                p = sector(cx, cy, r, angle, angle + angleplus, {fill:  color, stroke: stroke, "stroke-width": 1}),
                rect=paper.rect(paper.height+space+recth,space*2+recth*j+2,recth-4,recth-4).attr({fill:color,stroke:color}),
				text=paper.text(paper.height+space+2*recth,space*2+recth*j+2+recth*2/5, json.data[j].name+'('+(value*100/ total).toFixed(2)+'%)').attr({"font-size": 12,"text-anchor":"start",stroke: color});
			chart.push(p);
            chart.push(rect);
            chart.push(text);
            chart.mouseover(function () {
                p.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
                text.stop().animate({stroke:stroke}, ms, "elastic");
                rect.stop().animate({width:recth+text.getBBox().width+10}, ms, "bounce");
            }).mouseout(function () {
                p.stop().animate({transform: ""}, ms, "elastic");
                rect.stop().animate({width:recth-4}, ms, "bounce");
                text.stop().animate({stroke:rect.attrs.fill}, ms, "elastic");
            });
            angle += angleplus;
            start += .1;
        };
    paper.rect(0,0,paper.width,paper.height,5);
    paper.text(paper.width/2,10,json.title).attr({'font-size':20,fill:'#000'});
    for (var i=0;i<json.data.length;i++) {
        total += json.data[i].value;
    }
    for (i = 0; i < json.data.length; i++) {
        process(i);
    }
};


Raphael.fn.rectChart = function (json) {
    var paper = this,
	width=paper.width,
	height = paper.height,
	left=50,
	top=30,
	right=10,
    bottom = 30,
	innerHeight = paper.height-top-bottom,
	innerwidth = paper.width-left-right,
	max=99;
	
	paper.rect(0,0,paper.width,paper.height,5);
	paper.path('M '+left+' '+top+'L'+left+' '+(height-bottom)+'L'+(width-right)+' '+(height-bottom));
	paper.text(paper.width/2,10,json.title).attr({'font-size':20,fill:'#000'});
	
	for (var i=0;i<json.data.length;i++) {
        max = Math.max(json.data[i].value,max);
    }
	var label = paper.set();
	label.push(paper.text(10, 12, json.data[0].name).attr({fill: '#fff'}));
    label.push(paper.text(10, 27, json.data[0].value).attr({fill: '#fff'}));
    label.hide();
	var frame = paper.popup(20, 20, label, "top").attr({fill: "#59b37d","stroke-width":2,stroke:'#6b59b3', "fill-opacity": .5}).hide();
	
	var len = (max+'').length-2;
	if(len > 0){
		max = parseInt((max+'').substring(0,len));
		max ++;
		for(var i=0;i<2;i++){
			max = max*10;
		}
	}else{
		max ++;
	}
	
	var spaceheight = innerHeight/10;
	for(var i=0;i<10;i++){
		paper.path('M '+left+' '+(top+spaceheight*i)+'L'+(width-right)+' '+(top+spaceheight*i)).attr({'stroke-dasharray':'.','stroke-width':'0.1'});
		paper.text(left-5,(top+spaceheight*i),max/10*(10-i)).attr({'text-anchor':'end'});
	}
	paper.text(8,height/2,json.xlable).attr({'text-anchor':'middle','transform':'r270'});
	paper.text(width/2,height-8,json.ylabel).attr({'text-anchor':'middle'});
	
	
	var spacewidth = innerwidth/json.data.length;
    process = function (j){	
		var text=paper.text(left+spacewidth*j+ spacewidth/2,height-bottom+5,json.data[j].name).attr({'text-anchor':'middle'}).data('txt',json.data[j].name);
		var rect = paper.rect(left+spacewidth*j+2,height-bottom-json.data[j].value/max*innerHeight,spacewidth-4,json.data[j].value/max*innerHeight).attr({'stroke-width':'0',fill:'#59b37d',stroke:'#6b59b3'}).data('val',json.data[j].value);
		var rect2 = paper.rect(left+spacewidth*j,top,spacewidth,height-bottom).attr({'stroke-width':'0',fill:'#fff',"fill-opacity": 0});
		rect2.hover(function () {
			var side = "top";
			if (rect.getBBox().x+spacewidth/2 + frame.getBBox().width/2 > width) {
				side = "left";
			}
			var ppp = paper.popup(rect.getBBox().x+spacewidth/2, rect.getBBox().y, label, side, 1),
				anim = Raphael.animation({
					path: ppp.path,
					transform: ["t", ppp.dx, ppp.dy]
				}, 100);
			lx = label[0].transform()[0][1] + ppp.dx;
			ly = label[0].transform()[0][2] + ppp.dy;
			frame.show().stop().animate(anim).toFront();
			label[0].attr({text:text.data('txt')}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 100 ).toFront();
			label[1].attr({text:rect.data('val')}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 100 ).toFront();
			rect.stop().animate({'stroke-width':2}, 500, "elastic");
			text.stop().animate({'fill':'#59b37d'}, 500, "elastic");
		}, function () {
			frame.hide();
			label[0].hide();
			label[1].hide();
			rect.stop().animate({'stroke-width':0}, 500, "elastic");
			text.stop().animate({'fill':'#000'}, 500, "elastic");
		});
    }
	for(var j=0;j<json.data.length;j++){
        process(j);
	}
};
Raphael.fn.lineChart = function (json) {
    var paper = this,
	width=paper.width,
	height = paper.height,
	left=50,
	top=30,
	right=10,
    bottom = 30,
	innerHeight = paper.height-top-bottom,
	innerwidth = paper.width-left-right,
	max=99;
	
	paper.rect(0,0,paper.width,paper.height,5);
	paper.path('M '+left+' '+top+'L'+left+' '+(height-bottom)+'L'+(width-right)+' '+(height-bottom));
	paper.text(paper.width/2,10,json.title).attr({'font-size':20,fill:'#000'});
	
	for (var i=0;i<json.data.length;i++) {
        max = Math.max(json.data[i].value,max);
    }
	var label = paper.set();
	label.push(paper.text(10, 12, json.data[0].name).attr({fill: '#fff'}));
    label.push(paper.text(10, 27, json.data[0].value).attr({fill: '#fff'}));
    label.hide();
	var frame = paper.popup(20, 20, label, "top").attr({fill: "#59b37d","stroke-width":2,stroke:'#6b59b3', "fill-opacity": .5}).hide();
	
	var len = (max+'').length-2;
	if(len > 0){
		max = parseInt((max+'').substring(0,len));
		max ++;
		for(var i=0;i<2;i++){
			max = max*10;
		}
	}else{
		max ++;
	}
	
	var spaceheight = innerHeight/10;
	for(var i=0;i<10;i++){
		paper.path('M '+left+' '+(top+spaceheight*i)+'L'+(width-right)+' '+(top+spaceheight*i)).attr({'stroke-dasharray':'.','stroke-width':'0.1'});
		paper.text(left-5,(top+spaceheight*i),max/10*(10-i)).attr({'text-anchor':'end'});
	}
	paper.text(8,height/2,json.xlable).attr({'text-anchor':'middle','transform':'r270'});	
	
	var spacewidth = innerwidth/json.data.length;
    process = function (j){
		var text=paper.text(left+spacewidth*j+ spacewidth/2,height-bottom+5,json.data[j].name).attr({'text-anchor':'middle'}).data('txt',json.data[j].name);
		if(j != 0){
			var path = paper.path('M '+(left+spacewidth*(j-1)+spacewidth/2)+' '+(height-bottom-json.data[j-1].value/max*innerHeight)+'L'+(left+spacewidth*j+spacewidth/2)+' '+(height-bottom-json.data[j].value/max*innerHeight)).attr({'stroke-width':4,'stroke':'#59b37d'});
			path.toBack();
		}
		var circle = paper.circle(left+spacewidth*j+spacewidth/2,height-bottom-json.data[j].value/max*innerHeight,4).attr({'stroke-width':'0',fill:'#59b37d',stroke:'#6b59b3'}).data('val',json.data[j].value);
		var rect = paper.rect(left+spacewidth*j,top,spacewidth,height-bottom).attr({'stroke-width':'0',fill:'#fff',"fill-opacity": 0});
		rect.hover(function () {
			var side = "top";
			if (circle.getBBox().cx + frame.getBBox().width/2 > width) {
				side = "left";
			}
			var ppp = paper.popup(circle.getBBox().cx, circle.getBBox().cy, label, side, 1),
				anim = Raphael.animation({
					path: ppp.path,
					transform: ["t", ppp.dx, ppp.dy]
				}, 100);
			lx = label[0].transform()[0][1] + ppp.dx;
			ly = label[0].transform()[0][2] + ppp.dy;
			frame.show().stop().animate(anim).toFront();
			label[0].attr({text:text.data('txt')}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 100 ).toFront();
			label[1].attr({text:circle.data('val')}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 100 ).toFront();
			circle.stop().animate({'stroke-width':2}, 500, "elastic");
			text.stop().animate({'fill':'#59b37d'}, 500, "elastic");
		}, function () {
			frame.hide();
			label[0].hide();
			label[1].hide();
			circle.stop().animate({'stroke-width':0}, 500, "elastic");
			text.stop().animate({'fill':'#000'}, 500, "elastic");
		});
    }
	for(var j=0;j<json.data.length;j++){
        process(j);
	}
};