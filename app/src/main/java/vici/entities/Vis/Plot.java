package vici.entities.Vis;

import java.util.ArrayList;

/**
 * Author: Jonathan Wahlund.
 * Created on 2017-09-01.
 */
public class Plot {
    private ArrayList<Item> items;
    private long timeFirst;
    private long timeLast;
    private int valueMin;
    private int valueMax;

    public Plot(ArrayList<Item> items, long timeFirst, long timeFinish, int valueMin, int valueMax) {
        this.items = items;
        this.timeFirst = timeFirst;
        this.timeLast = timeFinish;
        this.valueMin = valueMin;
        this.valueMax = valueMax;
    }

    public ArrayList<Item> getItems() {
        return items;
    }

    public void setItems(ArrayList<Item> items) {
        this.items = items;
    }

    public long getTimeFirst() {
        return timeFirst;
    }

    public void setTimeFirst(long timeFirst) {
        this.timeFirst = timeFirst;
    }

    public long getTimeLast() {
        return timeLast;
    }

    public void setTimeLast(long timeLast) {
        this.timeLast = timeLast;
    }

    public int getValueMin() {
        return valueMin;
    }

    public void setValueMin(int valueMin) {
        this.valueMin = valueMin;
    }

    public int getValueMax() {
        return valueMax;
    }

    public void setValueMax(int valueMax) {
        this.valueMax = valueMax;
    }
}
