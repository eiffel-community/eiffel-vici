package vici.entities.Cytoscape;

import vici.entities.Time;

import java.util.ArrayList;
import java.util.HashMap;

public class Graph {
    private ArrayList<Element> elements;
    private HashMap<String, HashMap<String, Integer>> quantities;
    private Time time;

    public Graph() {
        this.elements = new ArrayList<>();
        this.quantities = new HashMap<>();
        this.time = new Time();
    }

    public void increaseInfo(String category, String value) {
        if (!quantities.containsKey(category)) {
            quantities.put(category, new HashMap<>());
        }
        if (!quantities.get(category).containsKey(value)) {
            quantities.get(category).put(value, 0);
        }
        quantities.get(category).put(value, quantities.get(category).get(value) + 1);
    }

    public Time getTime() {
        return time;
    }

    public void setTime(Time time) {
        this.time = time;
    }

    public ArrayList<Element> getElements() {
        return elements;
    }

    public void setElements(ArrayList<Element> elements) {
        this.elements = elements;
    }

    public HashMap<String, HashMap<String, Integer>> getQuantities() {
        return quantities;
    }

    public void setQuantities(HashMap<String, HashMap<String, Integer>> quantities) {
        this.quantities = quantities;
    }
}
