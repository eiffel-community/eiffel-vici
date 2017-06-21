package vici.entities;

public class Link {
    private String target;
    private String type;

    public Link(String target, String type) {
        this.target = target;
        this.type = type;
    }

    public String getTarget() {
        return target;
    }

    public String getType() {
        return type;
    }
}
