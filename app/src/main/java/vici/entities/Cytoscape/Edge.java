package vici.entities.Cytoscape;

public class Edge extends Element{
    private DataEdge data;

    private Info info;

    public Edge(String id, String source, String target, Info info) {
        data = new DataEdge(id,source,target);
        this.info = info;
    }

    public DataEdge getData() {
        return data;
    }

    public void setData(DataEdge data) {
        this.data = data;
    }

    public Info getInfo() {
        return info;
    }

    public void setInfo(Info info) {
        this.info = info;
    }
}
