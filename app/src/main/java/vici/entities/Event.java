package vici.entities;

import vici.entities.Eiffel.CustomData;
import vici.entities.Eiffel.Data;
import vici.entities.Eiffel.EiffelEvent;

import java.util.ArrayList;
import java.util.HashMap;

public class Event {
    private HashMap<String, Data> data;
    private HashMap<String, Long> times;
    private HashMap<String, Integer> quantities;
    private ArrayList<Event> mergedEvents;

    private String id;
    private String type;
    private ArrayList<Link> links;
    private String name;

    public Event(EiffelEvent eiffelEvent) {
        data = new HashMap<>();
        data.put("triggered", eiffelEvent.getData());

        times = new HashMap<>();
        times.put("triggered", eiffelEvent.getMeta().getTime());

        id = eiffelEvent.getMeta().getId();
        type = eiffelEvent.getMeta().getType();
        links = eiffelEvent.getLinks();

        name = null;
        if (eiffelEvent.getData().getCustomData() != null) {
            for (CustomData customData : eiffelEvent.getData().getCustomData()) {
                if (customData.getKey().equals("name")) {
                    name = customData.getValue();
                    break;
                }
            }
        }


        this.quantities = null;
        this.mergedEvents = null;
    }

    public Event(Event event, String redirect) {
//        this.mergedEvents = event.getMergedEvents();
        this.type = "REDIRECT";
        this.name = redirect;
        this.links = new ArrayList<>();
        links.add(new Link(redirect, "REDIRECT"));

        this.times = event.getTimes();
    }

    public void increaseQuantity(String quantity) {
        if (quantities == null) {
            quantities = new HashMap<>();
        }
        if (quantities.containsKey(quantity)) {
            quantities.put(quantity, quantities.get(quantity) + 1);

        } else {
            quantities.put(quantity, 1);
        }
    }

    public void addEvent(Event event) {
        if (mergedEvents == null) {
            mergedEvents = new ArrayList<>();
        }
        mergedEvents.add(event);
    }

    public HashMap<String, Data> getData() {
        return data;
    }

    public void setData(HashMap<String, Data> data) {
        this.data = data;
    }

    public HashMap<String, Long> getTimes() {
        return times;
    }

    public void setTimes(HashMap<String, Long> times) {
        this.times = times;
    }

    public HashMap<String, Integer> getQuantities() {
        return quantities;
    }

    public void setQuantities(HashMap<String, Integer> quantities) {
        this.quantities = quantities;
    }

    public ArrayList<Event> getMergedEvents() {
        return mergedEvents;
    }

    public void setMergedEvents(ArrayList<Event> mergedEvents) {
        this.mergedEvents = mergedEvents;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public ArrayList<Link> getLinks() {
        return links;
    }

    public void setLinks(ArrayList<Link> links) {
        this.links = links;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
