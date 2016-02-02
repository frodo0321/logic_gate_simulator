<h1>logic_gate_simulator</h1>
A logic gate simulator in javascript
</br></br>

<h6>add_*gate* definitions:</h6>
add_and=function(id, x, y, inv, num_inputs)</br>
add_or=function(id, x, y, inv, xor, num_inputs)</br>
add_buffer=function(id, x, y, inv)</br>
add_toggle_switch=function(id, x, y)</br>
add_led=function(id, x, y)</br>
add_custom=function(id, x, y, name, num_inputs, num_outputs, logic)</br>
</br></br>

<h6>add_*gate* parameter descriptions:</h6>
id \<str\> - unique id for each gate</br>
x \<int\> - x position in the svg element</br>
y \<int\> - y position in the svg element</br>
inv \<boolean\> - if true, gate becomes inverted</br>
num_inputs \<int\> - number of inputs a gate has</br>
xor \<boolean\> - if true, OR gate becomes XOR gate</br>
name \<str\> - name of custom gate</br>
num_outputs \<int\> - number of outputs for custom gate</br>
logic \<list\<function\>\> - list of functions where each function represents an output; each function is passed 1 argument, a list of input states where list.length==num_inputs, and returns a boolean value. 
</br></br>


<h6>USAGE:</h6></br>

1. create an html svg element </br><i>
  \<svg id="andgate" width="600" height="400"\></br>
  \</svg\></i>

2. inside a jquery "$(document).ready(function(){})" function, create a logic_container object with the id of the desired svg element as an argument</br><i>
	l=new logic_container('andgate');</i>

3. Add switch(es), gate(s), LED(s) to the logic_container object:</br><i>
  l.add_toggle_switch('s1', 10, 30);</br>
  l.add_toggle_switch('s2', 10, 60);</br>
  l.add_and('a1', 75, 30);</br>
  l.add_led('l1', 375, 80);</br></i>
  
4. Connect switches, gates, leds:</br><i>
  l.connect('s1', 0, 'a1', 0);</br>
  l.connect('s2', 0, 'a1', 1);</br>
  l.connect('a1', 0, 'l1', 0);</br></i>
  
5. Run simulator:</br><i>
  l.run_forever();</i>
