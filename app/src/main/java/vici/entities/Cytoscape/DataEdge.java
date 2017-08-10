package vici.entities.Cytoscape;

public class DataEdge {
    private String id;
    private String source;
    private String target;

    private String label;
    private String type;
    private int quantity;

    public DataEdge(String id, String source, String target, String label, String type) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.label = label;
        this.type = type;
        this.quantity = 1;
    }

    public void increaseQuantity() {
        quantity++;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
