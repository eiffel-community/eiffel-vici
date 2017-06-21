package vici.entities.Cytoscape;

import vici.entities.Time;

public class Info {
    private String label;
    private String type;
    private int quantity;
    private Time time;

    public Info(String label, String type) {
        this.label = label;
        this.type = type;
        this.quantity = 1;
    }

    public void increaseQuantity(){
        quantity++;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }
}
