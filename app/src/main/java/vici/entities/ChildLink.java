package vici.entities;

public class ChildLink {
    private String child;
    private String type;

    public ChildLink(String child, String type) {
        this.child = child;
        this.type = type;
    }

    public String getChild() {
        return child;
    }

    public void setChild(String child) {
        this.child = child;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}


