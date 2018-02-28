/*<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script src="Queue.js"></script>
</head>

<style>
.gate {
	fill: white;
	stroke: #6b6;
	stroke-width: 2;
}
.gate_text::selection {
	background:white;
}
</style>

<!--
<svg id="andgate" width="600" height="400">
</svg>
-->
<script>

*/

//jquery
var script=document.createElement('script');
script.src='https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js';
script.type='text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);


//Queue
  
//code.stephenmorley.org
function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};
                        
window.logic_container = function logic_container(svg_id)
{
	var svg_element=$('#'+svg_id);
	this.svg_element=svg_element;

	this.gates={};

	//the simulation
	//have a queue with gates in it; when run_next is called, pop a gate off the queue, set the output value, and push the folowing gate on the queue
	//setInterval(function, time (ms))
	
	this.gate_queue=new Queue()

	this.run_next=function(lc)
	{
		var g=lc.gate_queue.dequeue()
		if (typeof(g) == "undefined"){return}
		if (g.type=='switch')
		{
			for (var i=0;i<g.outputs[0].connections.length;i++)
			{
				lc.gate_queue.enqueue(g.outputs[0].connections[i].input.gate);
			}
			return;
		}
		var input_states=[];
		for (var i=0; i<g.inputs.length; i++)
		{
			input_states.push(g.inputs[i].state=='true');
		}
		for (var i=0; i<g.outputs.length; i++)
		{
			var state=g.outputs[i].logic(input_states);
			for (var j=0; j<g.outputs[i].connections.length;j++)
			{
				
				var connection=g.outputs[i].connections[j];
				connection.set(state);
				var next_gate = connection.input.gate;
				if (next_gate.type=="led"){next_gate.set_state(state);}
				else {lc.gate_queue.enqueue(connection.input.gate)};
			}
		}
	}

	this.run_forever=function(time_interval)
	{
		var f=this.run_next;
		var lc=this;
		setInterval(function(){f(lc)}, time_interval);
	}

	this.switch_callback=function(s)
	{
		for (var i=0;i<s.output.connections.length;i++)
		{
			s.output.connections[i].toggle();
			this.gate_queue.enqueue(s.output.connections[i].input.gate);
		}
	}


	//refresh html after gate has been created to display gate
	this.refresh_html = function()
	{
		
		this.svg_element.html(this.svg_element.html());
		var th=this;
		$('.togglable.'+svg_id)
			.on('click', function(e){
				id=th.svg_element.find('#'+this.id).parent().attr('id');
				s=th.gates[id];
				s.toggle();
				th.switch_callback(s);
			});
	}

	//create and gate
	this.add_and=function(id, x, y, inv, num_inputs)
	{
		var g=new this.and_gate(id, x, y, inv, num_inputs);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.refresh_html();
		return g;
	}

	//create or gate
	this.add_or=function(id, x, y, inv, xor, num_inputs)
	{
		var g=new this.or_gate(id, x, y, inv, xor, num_inputs);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.refresh_html();
		return g;
	}

	//create buffer
	this.add_buffer=function(id, x, y, inv)
	{
		var g=new this.buffer(id, x, y, inv);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.refresh_html();
		return g;
	}

	//create toggle switch
	this.add_toggle_switch=function(id, x, y)
	{
		var g=new this.toggle_switch(id, x, y);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.gate_queue.enqueue(g);
		this.refresh_html();
		return g;
	}

	//create an led
	this.add_led=function(id, x, y)
	{
		var g=new this.led(id, x, y);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.refresh_html();
		return g;
	}

	//create customizable gate
	this.add_custom=function(id, x, y, name, num_inputs, num_outputs, logic)
	{
		var g=new this.customizable_gate(id, x, y, name, num_inputs, num_outputs, logic);
		this.gates[id]=g;
		this.svg_element.append(g.$gate);
		this.refresh_html();
		return g;
	}

	//toggle function for gates/connections; toggles color and state
	var toggle=function()
	{
		if(this.id==''){return;}
		var e=svg_element.find('#'+this.id);
		e.attr('state')=='true'? e.attr({'state':'false','stroke':'black'}) : e.attr({'state':'true','stroke':'red'});	
		this.state=='true'? this.state='false' : this.state='true';
	}

	//set function for gates/connections; sets color and state
	var set=function(state)
	{
		if(this.id==''){return;}
		var s=state.toString();
		svg_element.find('#'+this.id).attr({'state':s,'stroke':s=='true'? 'red':'black'});
		this.state=s;
	}


	/*
	*******************************************************************************************************
	*****************************************   GATES   ***************************************************
	*******************************************************************************************************
	*/
	


	/*
	*******************************************   AND GATE   *************************************************
	*/

	this.and_gate=function And_Gate(id, x, y, inv, num_inputs)
	{
		this.num_inputs=num_inputs || 2;
		this.width=25;
		this.height=20*this.num_inputs;
		this.type='and';
		inv=inv || false;
		this.inv=inv;

		this.id=id;

		this.inputs=[];
		for (var i=0;i<this.num_inputs;i++)
		{
			var ypos=y+((this.height)*((i+1)/(this.num_inputs+1)));
			var input={'id':id+'_input'+i.toString(),'x1':x-15,'x2':x-1,'y1':ypos,'y2':ypos,'state':'false','stroke':'black','x':x-15,'y':ypos,'toggle':toggle,'set':set,'connection':null,'gate':this}
			this.inputs.push(input);
		}
		this.outputs=[];

		//this.input1={'id':id+'_input1','x1':x-15,'x2':x-1,'y1':y+10,'y2':y+10,'state':'false','stroke':'black','x':x-15,'y':y+10,'toggle':toggle,'set':set,'connection':null,'gate':this}

		//this.input2={'id':id+'_input2','x1':x-15,'x2':x-1,'y1':y+30,'y2':y+30,'state':'false','stroke':'black','x':x-15,'y':y+30,'toggle':toggle,'set':set,'connection':null,'gate':this}

		this.output={'id':id+'_output','x1':x+this.width+this.height/2+1,'x2':x+this.width+this.height/2+15,'y1':y+this.height/2,'y2':y+this.height/2,'state':'false','stroke':'black','x':x+this.width+this.height/2+15,'y':y+this.height/2,'toggle':toggle,'set':set,'connections':[],'gate':this}
		this.output.logic=function(i)
		{
			for (var j=0;j<i.length;j++)
			{
				if (!i[j])
				{
					return inv;
				}
			}
			return !inv;
		}

		//this.inputs.push(this.input1);
		//this.inputs.push(this.input2);

		this.outputs.push(this.output);


		this.$gate=$('<g></g>')
			.attr({'id':id})

			.append($('<path></path>')
				.addClass('gate')
				.attr({d:'M ' + x.toString() + ' ' + y.toString() + ' l ' + this.width + ' 0 a ' + (this.num_inputs*10).toString() + ' ' + (this.num_inputs*10).toString() + ' 0 1 1 0 ' + this.height.toString() + ' l ' + (-this.width).toString() + ' 0 l 0 ' + (-this.height).toString()}))
/*			.append($('<text></text>')
				.addClass('gate_text')
				.attr({'x':x+3,'y':y+this.height/2+4})
				.append('AND'))
*/			//.append($('<line></line>')
			//	.attr(this.input1))
			//.append($('<line></line>')
			//	.attr(this.input2))
			.append($('<line></line>')
				.attr(this.output))
			;

			for (var i=0;i<this.num_inputs;i++)
			{
				this.$gate.append($('<line></line>')
					.attr(this.inputs[i]));
			}	

		//add circle to gate
		if(this.inv)
		{
			this.$gate
				.append($('<circle></circle>')
					.addClass('gate')
					.attr({'cx':x+this.width+this.height/2+4,'cy':y+this.height/2,'r':4})
				);
			output=this.$gate.find('#'+id+'_output');
			output
					.attr({'x1':x+this.width+this.height/2+9,'y1':y+this.height/2,'x2':x+this.width+this.height/2+23,'y2':y+this.height/2});
			this.output['x']=x+this.width+this.height/2+23;
		}

	}

	/*
	*******************************   OR GATE   *********************************
	*/

	this.or_gate=function Or_Gate(id, x, y, inv, xor, num_inputs)
	{
		this.num_inputs=num_inputs || 2;
		inv=inv || false;
		this.inv=inv;
		xor=xor || false;
		this.type=xor ? 'xor' : 'or';
		this.num_inputs=xor?2:this.num_inputs;
		this.x=x;
		this.y=y;
	
		this.width=25;
		this.height=this.num_inputs*20;


		this.inputs=[];
		for (var i=0;i<this.num_inputs;i++)
		{
			var ypos=y+((this.height)*((i+1)/(this.num_inputs+1)));
			var input={'id':id+'_input'+i.toString(),'x1':x-11,'x2':x-1,'y1':ypos,'y2':ypos,'state':'false','stroke':'black','x':x-11,'y':ypos,'toggle':toggle,'set':set,'connection':null,'gate':this}
			this.inputs.push(input);
		}

//		this.input1={'id':id+'_input1','x1':x-11,'x2':x+3,'y1':y+10,'y2':y+10,'state':'false','stroke':'black','x':x-11,'y':y+10,'toggle':toggle,'set':set,'connection':null,'gate':this}

//		this.input2={'id':id+'_input2','x1':x-11,'x2':x+3,'y1':y+30,'y2':y+30,'state':'false','stroke':'black','x':x-11,'y':y+30,'toggle':toggle,'set':set,'connection':null,'gate':this}

		this.outputs=[];

		this.output={'id':id+'_output','x1':x+this.width+this.height/2+1,'x2':x+this.width+this.height/2+15,'y1':y+this.height/2,'y2':y+this.height/2,'state':'false','stroke':'black','x':x+this.width+this.height/2+15,'y':y+this.height/2,'toggle':toggle,'set':set,'connections':[],'gate':this}
		this.output.logic=function(i)
		{
			for (var j=0;j<i.length;j++)
			{
				if (i[j])
				{
					return !inv;
				}
			}
			return inv;
		}

		//this.inputs.push(this.input1);
		//this.inputs.push(this.input2);

		this.outputs.push(this.output);

		this.$gate=$('<g></g>')
			.attr({'id':id})
			.append($('<path></path>')
				.addClass('gate')
				.attr({d:'M ' + x.toString() + ' ' + y.toString() + ' q ' + (this.num_inputs*15).toString() + ' ' + (-this.num_inputs).toString() + ' ' + (this.width+this.height/2).toString() + ' ' + (this.height/2).toString()}))
			.append($('<path></path>')
				.addClass('gate')
				.attr({d:'M ' + x.toString() + ' ' + (y+this.height).toString() + ' q ' + (this.num_inputs*15).toString() + ' ' + (this.num_inputs).toString() + ' ' + (this.width+this.height/2).toString() + ' ' + (-this.height/2).toString()}))
			.append($('<path></path>')
				.addClass('gate')
				.attr({d:'M ' + x.toString() + ' ' + y.toString() + ' q 10 ' + (this.height/2).toString() + ' 0 ' + this.height.toString()}));
/*			.append($('<text></text>')
				.addClass('gate_text')
				.attr({'x':x+8,'y':y+this.height/2+4})
				.append('OR'))
*/
			if(xor)
			{
				this.$gate.append($('<path></path>')
					.addClass('gate')
					.attr({d:'M ' + (x-5).toString() + ' ' + y.toString() + ' q 10 ' + (this.height/2).toString() + ' 0 ' + this.height.toString()}))
				this.outputs[0].logic=function(i){var ret=(i[0] ^ i[1])==1; ret=(this.inv ? !ret : ret); return ret;}
			}
//			this.$gate.append($('<line></line>')
//				.attr(this.input1))
//			this.$gate.append($('<line></line>')
//				.attr(this.input2))
			this.$gate.append($('<line></line>')
				.attr(this.output))
		;
			for (var i=0;i<this.num_inputs;i++)
			{
				this.$gate.append($('<line></line>')
					.attr(this.inputs[i]));
			}	

	
		if(this.inv)
		{
			this.$gate
				.append($('<circle></circle>')
					.addClass('gate')
					.attr({'cx':x+this.width+this.height/2+4,'cy':y+this.height/2,'r':4})
				)
			;
			output=this.$gate.find('#'+id+'_output');
			output
					.attr({'x1':x+this.width+this.height/2+9,'y1':y+this.height/2,'x2':x+this.width+this.height/2+23,'y2':y+this.height/2});
			this.output['x']=x+this.width+this.height/2+23;
		}
	}

	/*
	************************************   BUFFER   ***************************************
	*/
	
	this.buffer=function Buffer(id, x, y, inv)
	{
		this.inv=inv || false;
		this.type='buffer';
		this.x=x;
		this.y=y;
	
		this.width=25;
		this.height=20;

		this.inputs=[];
		this.outputs=[];
	
		this.input1={'id':id+'_input','x1':x-14,'x2':x,'y1':y+this.height/2,'y2':y+this.height/2,'state':'false','stroke':'black','x':x-14,'y':y+this.height/2,'toggle':toggle,'set':set,'connection':null,'gate':this}

		this.output={'id':id+'_output','x1':x+this.width,'x2':x+this.width+14,'y1':y+this.height/2,'y2':y+this.height/2,'state':'false','stroke':'black','x':x+this.width+14,'y':y+this.height/2,'toggle':toggle,'set':set,'connections':[],'gate':this}
		this.output.logic=function(i)
		{
			var ret=i[0];
			ret=(inv ? !ret : ret);
			return ret;
		}

		this.inputs.push(this.input1);
		this.outputs.push(this.output);
		
	
		this.$gate=$('<g></g>')
			.attr({'id':id,'inv':inv})
			.append($('<path></path>')
				.addClass('gate')
				.attr({'d':'M ' + x.toString() + ' ' + y.toString() + ' L '+ (x+this.width).toString() + ' ' + (y+this.height/2).toString() + ' ' + x.toString() + ' ' + (y+this.height).toString() + ' ' + x.toString() + ' ' + y.toString() }))
			.append($('<line></line>')
				.attr(this.input1))
			.append($('<line></line>')
				.attr(this.output))
		;
	
		if(inv)
		{
			this.$gate
				.append($('<circle></circle>')
					.addClass('gate')
					.attr({'cx':x+this.width+4,'cy':y+this.height/2,'r':4})
				)
			;
		}		
	
	}
	


	/*
	************************************************   TOGGLE SWITCH   ************************************************
	*/


	this.toggle_switch=function Toggle_Switch(id, x, y)
	{
		this.type='switch';

		this.output={'id':id+'_input','x1':x+30,'x2':x+44,'y1':y+10,'y2':y+10,'state':'false','stroke':'black','x':x+44,'y':y+10,'toggle':toggle,'set':set,'connections':[],'gate':this}
		
		this.outputs=[];
		this.outputs.push(this.output);

		this.$gate=$('<g></g>')
			.attr({'id':id})
			.append($('<path></path>')
				.attr({'d':'M '+x.toString()+' '+y.toString()+' L '+(x+20).toString()+' '+y.toString()+' L '+(x+30).toString()+' '+(y+10).toString()+' L '+(x+20).toString()+' '+(y+20).toString()+' L '+(x).toString()+' '+(y+20).toString()+' L '+x.toString()+' '+y.toString(),'stroke':'#4b4','fill':'white'}))
			.append($('<circle></circle>')
				.addClass('togglable')
				.addClass(svg_id)
				.attr({'id':id+'_switch','state':'false','cx':x+13,'cy':y+10,'r':8,'stroke':'#6b6','stroke-width':2,'fill':'#ddd'}))
			.append($('<line></line>')
				.attr(this.output))
		;

		this.toggle=function()
		{
			var s=svg_element.find('#'+id+'_switch');
			if(s.attr('state')=='true')
			{
				s.attr({'state':'false','fill':'#ddd'});
			}
			else
			{
				s.attr({'state':'true','fill':'red'});
			}
		}
		
		this.set_state=function(state)
		{
			var s=state.toString()
			svg_element.find('#'+id+'_switch').attr({'state':s,'fill':s=='true'? 'red':'#ddd'});
		}
		this.get_state=function()
		{
			return svg_element.find('#'+id+'_switch').attr('state')=='true';
		}
	}


	/*
	**********************************************   LED   *****************************************************
	*/


	this.led=function Led(id, x, y)
	{
		this.type='led';

		this.inputs=[];
		this.input1={'id':id+'_output','x1':x-14,'x2':x,'y1':y+10,'y2':y+10,'state':'false','stroke':'black','x':x-14,'y':y+10,'toggle':toggle,'set':set,'connection':null,'gate':this}
		this.inputs.push(this.input1);
	
		this.$gate=$('<g></g>')
			.attr({'id':id})
			.addClass('led')
			.append($('<circle></circle>')
				.attr({'cx':x+10,'cy':y+10,'r':10,'stroke-width':2,'stroke':'#6b6','fill':'white'}))
			.append($('<circle></circle>')
				.attr({'id':id+'_led','cx':x+10,'cy':y+10,'r':7,'stroke-width':0,'stroke':'#6b6','fill':'#ddd'}))
			.append($('<line></line>')
				.attr(this.input1))
		;

		this.toggle=function()
		{
			var s=svg_element.find('#'+id+'_led');
			if(s.attr('state')=='true')
			{
				s.attr({'state':'false','fill':'#ddd'});
			}
			else
			{
				s.attr({'state':'true','fill':'red'});
			}
		}
		
		this.set_state=function(state)
		{
			var s=state.toString()
			svg_element.find('#'+id+'_led').attr({'state':s,'fill':s=='true'? 'red':'#ddd'});
		}
		this.get_state=function()
		{
			return svg_element.find('#'+id+'_led').attr('state')=='true';
		}
	}

	/*
	*******************************   CUSTOMIZABLE   ******************************
	*/

	this.customizable_gate=function Customizable_Gate(id, x, y, name, num_inputs, num_outputs, logic)
	//logic is an array containing num_outputs functions, each of which receive an argumet that is an array of size num_inputs
	{
		this.type='customizable';
		this.x=x;
		this.y=y;
	
		var mio=Math.max(num_inputs, num_outputs);

		this.width=10+name.length*10;
		this.height=20*mio;

		this.inputs=[];
		this.outputs=[];
		for (var i=0;i<num_inputs;i++)
		{
			var ypos=y+((this.height)*((i+1)/(num_inputs+1)));
			var input={'id':id+'_input'+i.toString(),'x1':x-14,'x2':x,'y1':ypos,'y2':ypos,'state':'false','stroke':'black','x':x-14,'y':ypos,'toggle':toggle,'set':set,'connection':null,'gate':this}
			this.inputs.push(input);
		}
		for (var i=0;i<num_outputs;i++)
		{
			var ypos=y+((this.height)*((i+1)/(num_outputs+1)));
			var output={'id':id+'_output'+i.toString(),'x1':x+this.width,'x2':x+this.width+14,'y1':ypos,'y2':ypos,'state':'false','stroke':'black','x':x+this.width+14,'y':ypos,'toggle':toggle,'set':set,'connections':[],'gate':this}
			output.logic=logic[i];
			this.outputs.push(output);
		}
		
	
		this.$gate=$('<g></g>')
			.attr({'id':id})
			.append($('<line></line>')
				.addClass('gate')
				.attr({'x1':x,'x2':x+this.width,'y1':y,'y2':y,'stroke':'black'}))
			.append($('<line></line>')
				.addClass('gate')
				.attr({'x1':x+this.width,'x2':x+this.width,'y1':y,'y2':y+this.height,'stroke':'black'}))
			.append($('<line></line>')
				.addClass('gate')
				.attr({'x1':x+this.width,'x2':x,'y1':y+this.height,'y2':y+this.height,'stroke':'black'}))
			.append($('<line></line>')
				.addClass('gate')
				.attr({'x1':x,'x2':x,'y1':y+this.height,'y2':y,'stroke':'black'}))
			.append($('<text></text>')
				.addClass('gate_text')
				.attr({'x':x+this.width/2,'y':y+this.height/2+4, 'text-anchor':'middle'})
				.append(name));
			for (var i=0;i<num_inputs;i++)
			{
				this.$gate.append($('<line></line>')
					.attr(this.inputs[i]));
			}	

			for (var i=0;i<num_outputs;i++)
			{
				this.$gate.append($('<line></line>')
					.attr(this.outputs[i]));
			}	
		
	}

	/*
	*********************************  CONNECTION FUNCTION  **************************************
	*/

	this.connect=function(output_gate, output_number, input_gate, input_number)
	{
		ig=this.gates[input_gate];
		og=this.gates[output_gate];
		input=ig.inputs[input_number];
		output=og.outputs[output_number];

		line={'id':output.id+'_to_'+input.id,'state':'false','x1':input.x,'x2':output.x,'y1':input.y,'y2':output.y,'stroke':'black','toggle':toggle,'set':set};
		$line=$('<g></g>').append($('<line></line>').attr(line));
		this.svg_element.append($line);
		this.refresh_html();

		connection={'input_gate':ig,'output_gate':og,'input':input,'output':output,'line':line,'toggle':function(){this.input.toggle();this.output.toggle();this.line.toggle();},'set':function(s){this.input.set(s);this.output.set(s);this.line.set(s);}};
		input.connection=connection;
		output.connections.push(connection);
	}
}	
/*
$(document).ready(function()
{
	l=new logic_container('andgate');
	l.add_and('a1', 75, 30, inv=true);
	l.add_and('a2', 155, 50);
	l.add_or('o1', 225, 70, inv=true);
	l.add_buffer('b1', 310, 90, inv=true);
	l.add_toggle_switch('s1', 10, 30);
	l.add_toggle_switch('s2', 10, 50);
	l.add_toggle_switch('s3', 10, 70);
	l.add_toggle_switch('s4', 10, 90);
	l.add_led('l1', 375, 80);

	l.add_toggle_switch('s5', 20, 170);
	l.add_custom('c1', 20, 200, 'test', 1, 1, [function(i){return true;}, function(i){return true;}]);
	l.add_custom('c2', 100, 200, 'testtest', 4, 2, [function(i){return true;}, function(i){return true;}]);
	l.add_custom('c3', 220, 200, 'testtesttest', 8, 5, [function(i){return true;}, function(i){return true;}]);
	l.add_led('l2', 20, 230);

	l.connect('s5', 0, 'c1', 0);
	l.connect('c1', 0, 'l2', 0);

	l.connect('s1', 0, 'a1', 0);
	l.connect('a1', 0, 'a2', 0);
	l.connect('s2', 0, 'a1', 1);
	l.connect('a2', 0, 'o1', 0);
	l.connect('s3', 0, 'a2', 1);
	l.connect('s4', 0, 'o1', 1);
	l.connect('o1', 0, 'b1', 0);
	l.connect('b1', 0, 'l1', 0);


	//nor latch
	l.add_toggle_switch('ls1', 430, 100);
	l.add_toggle_switch('ls2', 430, 180);
	l.add_or('lo1', 500, 100, inv=true);
	l.add_or('lo2', 500, 160, inv=true);
	l.add_led('ll1', 590, 110);

	l.connect('ls1', 0, 'lo1', 0);
	l.connect('ls2', 0, 'lo2', 1);
	l.connect('lo1', 0, 'lo2', 0);
	l.connect('lo2', 0, 'lo1', 1);
	l.connect('lo1', 0, 'll1', 0);

	l.run_forever(10);

}
)*/

//</script>
