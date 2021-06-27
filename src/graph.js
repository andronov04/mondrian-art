function GraphNode(val) {
  this.val = val;
  this.edges = {};
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Graph() {
  this.vertices = {};
}

// O(1) operation
Graph.prototype.addVertex = function(val) {
  // add vertex only if it does not exist.
  if (!this.vertices[val]) {
    this.vertices[val] = new GraphNode(val);
  }
};

// O(E) operation - edges
Graph.prototype.removeVertex = function(val) {
  if (this.vertices[val]) {
    // once you remove a vertex, you need to remove all edges pointing
    // to the vertex.
    delete this.vertices[val];

    Object.keys(this.vertices).forEach(function(key, index) {
      if (this.vertices[key].edges[val]) {
        delete this.vertices[key].edges[val];
      }
    }.bind(this));
  }
};

// O(1) operation
Graph.prototype.getVertex = function(val) {
  return this.vertices[val];
};

// O(1) operation
Graph.prototype.addEdge = function(start, end, weight) {
  // check to see if vertices exists.
  // if it exists, set the edges and be done.
  if (this.vertices[start] && this.vertices[end]) {

    // check to see if edge exists, if it does, increment it's weight
    if (this.vertices[start].edges[end]) {
      this.vertices[start].edges[end].weight = weight;
    } else {

      // edge does not exist, set weight to 1.
      this.vertices[start].edges[end] = { weight: weight };
    }
  }
};
