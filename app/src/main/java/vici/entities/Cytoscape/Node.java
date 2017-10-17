package vici.entities.Cytoscape;

public class Node extends Element {
    private DataNode data;
    private Position position;

    public Node(DataNode data) {
        this.data = data;
    }

    public Node(DataNode data, Position position) {
        this.data = data;
        this.position = position;
    }

    public Node() {
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public DataNode getData() {
        return data;
    }

    public void setData(DataNode data) {
        this.data = data;
    }
}
