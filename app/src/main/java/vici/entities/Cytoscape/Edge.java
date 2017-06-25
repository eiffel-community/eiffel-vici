package vici.entities.Cytoscape;

public class Edge extends Element{
    private DataEdge data;

    public Edge(DataEdge data) {
        this.data = data;
    }

    public DataEdge getData() {
        return data;
    }

    public void setData(DataEdge data) {
        this.data = data;
    }
}
