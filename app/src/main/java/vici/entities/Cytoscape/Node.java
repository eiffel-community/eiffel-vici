package vici.entities.Cytoscape;

public class Node extends Element {
    private DataNode data;

    public Node(DataNode data) {
        this.data = data;
    }

    public DataNode getData() {
        return data;
    }

    public void setData(DataNode data) {
        this.data = data;
    }
}
