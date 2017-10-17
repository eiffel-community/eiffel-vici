package vici.entities.Cytoscape;

import java.util.HashMap;

public class DataNode {

    private String id;

    private String label;
    private String type;
    private int quantity;

    private String value;

    private HashMap<String, Integer> quantities;
    private HashMap<String, String> info;
    private HashMap<String, Long> times;

    public DataNode(String id, String label, String type, String value, int quantity) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.quantity = quantity;
        this.value = value;
        this.quantities = new HashMap<>();
        this.info = new HashMap<>();
        this.times = new HashMap<>();
    }

    public DataNode(String id, String label, String type, String value) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.quantity = 1;
        this.value = value;
        this.quantities = new HashMap<>();
        this.info = new HashMap<>();
        this.times = new HashMap<>();
    }

    public void increaseQuantity(String key) {
        if (!quantities.containsKey(key)) {
            quantities.put(key, 1);
        } else {
            quantities.put(key, quantities.get(key) + 1);
        }
        quantity++;
    }

    public HashMap<String, Long> getTimes() {
        return times;
    }

    public void setTimes(HashMap<String, Long> times) {
        this.times = times;
    }

    public HashMap<String, String> getInfo() {
        return info;
    }

    public void setInfo(HashMap<String, String> info) {
        this.info = info;
    }

    public void increaseQuantity() {
        quantity++;
    }

    public HashMap<String, Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(HashMap<String, Integer> quantities) {
        this.quantities = quantities;
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
