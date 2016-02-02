<h1>logic_gate_simulator</h1>
A logic gate simulator in javascript


<h6>add_*gate* definitions:</h6>
add_and=function(id, x, y, inv, num_inputs)
add_or=function(id, x, y, inv, xor, num_inputs)
add_buffer=function(id, x, y, inv)
add_toggle_switch=function(id, x, y)
add_led=function(id, x, y)
add_custom=function(id, x, y, name, num_inputs, num_outputs, logic)

<h6>add_*gate* parameter descriptions:</h6>
id <str> - unique id for each gate
x <int> - x position in the svg element
y <int> - y position in the svg element
inv <boolean> - if true, gate becomes inverted
num_inputs <int> - number of inputs a gate has
xor <boolean> - if true, OR gate becomes XOR gate
name <str> - name of custom gate
num_outputs <int> - number of outputs for custom gate
logic <list<function>> - list of functions where each function represents an output; each function is passed 1 argument, a list of input states where list.length==num_inputs, and returns a boolean value. 



USAGE:
1. create an html svg element 
  <svg id="andgate" width="600" height="400">
  </svg>

2. inside a jquery "$(document).ready(function(){})" function, create a logic_container object with the id of the desired svg element as an argument
	l=new logic_container('andgate');

3. Add switch(es), gate(s), LED(s) to the logic_container object:
  l.add_toggle_switch('s1', 10, 30);
  l.add_toggle_switch('s2', 10, 60);
  l.add_and('a1', 75, 30);
  l.add_led('l1', 375, 80);
  
4. Connect switches, gates, leds:
  l.connect('s1', 0, 'a1', 0);
  l.connect('s2', 0, 'a1', 1);
  l.connect('a1', 0, 'l1', 0);
  
5. Run simulator:
  l.run_forever();
