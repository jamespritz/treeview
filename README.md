treeview
========

checked treeview control

This control was created to filter potentially deep trees, where it would be impractical to load the entire tree at one time.  The efficiency on the client, though, is at the expense of the server, where a great deal of logic
is required to facilitate dynamic loading of branches while syncronizing persisted filters.  To elaborate, I'll first
explain the possible states of each node..

Selected: 
  - if the node has children, indicates that all of its descendants are selected.
  - if no children, indicates that the node is selected.
Unselected:
  - if the node has children, indicates that none of its descendants are selected.
  - if no children, indicates that the node is not selected.
Mixed:
  - only applies to nodes with children, indicated that some (but not all) of its descendents are selected.

note that there is ***no*** use case where a node with children can be selected while none of its children are selected.
This is for efficiency, though in my travels I have yet to encounter that use case anyway.  
- if a node is selected, there need be only one record persisted for that node, regardless of how many descendents exist.

Now, to elaborate on the complexity, imagine if a node three levels deep is selected while its siblings are not, but we've only loaded the first level; this means that the server needs to advise the client that the selected node's first level ancestor needs to represent a 'mixed' state.  Furthermore, if the user then selects the ancestor node to indicate that all of its descendants are selected, the client needs to resolve this discrepancy if that third level is loaded... and the server needs to resolve the persisted state when updating ( ie. removing the 3rd level node and adding the ancestor).
