package vici.entities.Vis;

/**
 * Author: Jonathan Wahlund.
 * Created on 2017-09-01.
 */
public class Item {
    private long x;
    private long y;
    // 0 = inconlusive, 1 = pass,   2 = fail
    private int group;
    private String label;

    public Item(long x, long y, int group, String label) {
        this.x = x;
        this.y = y;
        this.group = group;
        this.label = label;
    }

    public long getX() {
        return x;
    }

    public void setX(long x) {
        this.x = x;
    }

    public long getY() {
        return y;
    }

    public void setY(long y) {
        this.y = y;
    }

    public int getGroup() {
        return group;
    }

    public void setGroup(int group) {
        this.group = group;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
