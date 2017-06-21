package vici.entities.Cytoscape;

public class Node extends Element{
    private DataNode data;

    private Info info;

    public Node(String id, Info info) {
        data = new DataNode(id);
        this.info = info;
    }

    public DataNode getData() {
        return data;
    }

    public void setData(DataNode data) {
        this.data = data;
    }

    public Info getInfo() {
        return info;
    }

    public void setInfo(Info info) {
        this.info = info;
    }
}
