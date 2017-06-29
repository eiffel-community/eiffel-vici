package vici.entities.Cytoscape;

import java.util.HashMap;

public class DataNode {

    private String id;

    private String label;
    private String type;
    private int quantity;

    private String value;

    private HashMap<String, Long> data;

    public DataNode(String id, String label, String type, String value) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.quantity = 0;
        this.value = value;
        this.data = new HashMap<>();
    }

    public void increaseQuantity(String key) {
        if (!data.containsKey(key)) {
            data.put(key, (long) 0);
        }
        data.put(key, data.get(key) + 1);
        quantity++;
    }

    public void increaseQuantity() {
        quantity++;
    }

    public HashMap<String, Long> getData() {
        return data;
    }

    public void setData(HashMap<String, Long> data) {
        this.data = data;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
