package vici.entities;

import vici.entities.Eiffel.EiffelEvent;

import java.util.ArrayList;
import java.util.HashMap;

public class Event {
    public static final String TRIGGERED = "Triggered";
    public static final String STARTED = "Started";
    public static final String FINISHED = "Finished";
    public static final String CANCELED = "Canceled";
    public static final String EXECUTION = "Execution";

    public static final String REDIRECT = "REDIRECT";

    private EiffelEvent thisEiffelEvent;
    private HashMap<String, EiffelEvent> eiffelEvents;
    private HashMap<String, Long> times;
    private HashMap<String, Integer> quantities;
    private ArrayList<Event> mergedEvents;


    private String id;
    private String type;
    private ArrayList<Link> links;
    private ArrayList<ChildLink> children;
    private String aggregateOn;

    public Event(EiffelEvent eiffelEvent) {
        thisEiffelEvent = eiffelEvent;
        eiffelEvents = new HashMap<>();
        eiffelEvents.put(TRIGGERED, eiffelEvent);

        times = new HashMap<>();
        times.put(TRIGGERED, eiffelEvent.getMeta().getTime());

        id = eiffelEvent.getMeta().getId();
        type = eiffelEvent.getMeta().getType();
        links = eiffelEvent.getLinks();
        children = new ArrayList<>();

        aggregateOn = null;

        quantities = null;
        mergedEvents = null;
    }

    public Event(Event event, String redirect) {
//        this.mergedEvents = event.getMergedEvents();
        this.id = event.getId();
        this.type = REDIRECT;
        this.aggregateOn = redirect;
//        this.links = event.getLinks();
//        this.children = new ArrayList<>();

//        this.times = event.getTimes();
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

    public EiffelEvent getThisEiffelEvent() {
        return thisEiffelEvent;
    }

    public void setThisEiffelEvent(EiffelEvent thisEiffelEvent) {
        this.thisEiffelEvent = thisEiffelEvent;
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

    public String getAggregateOn() {
        return aggregateOn;
    }

    public void setAggregateOn(String aggregateOn) {
        this.aggregateOn = aggregateOn;
    }

    public ArrayList<ChildLink> getChildren() {
        return children;
    }

    public void setChildren(ArrayList<ChildLink> children) {
        this.children = children;
    }

    public HashMap<String, EiffelEvent> getEiffelEvents() {
        return eiffelEvents;
    }

    public void setEiffelEvents(HashMap<String, EiffelEvent> eiffelEvents) {
        this.eiffelEvents = eiffelEvents;
    }
}
