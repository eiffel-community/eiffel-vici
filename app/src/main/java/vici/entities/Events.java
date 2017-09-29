package vici.entities;

import java.util.HashMap;

public class Events {
    private HashMap<String, Event> events;
    private long timeStart;
    private long timeEnd;
    private long timeCollected;

    public Events(HashMap<String, Event> events, long timeStart, long timeEnd) {
        this.events = events;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.timeCollected = System.currentTimeMillis();
    }

    public Events(HashMap<String, Event> events, long timeStart, long timeEnd, long timeCollected) {
        this.events = events;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.timeCollected = timeCollected;
    }

    public HashMap<String, Event> getEvents() {
        return events;
    }

    public void setEvents(HashMap<String, Event> events) {
        this.events = events;
    }

    public long getTimeStart() {
        return timeStart;
    }

    public void setTimeStart(long timeStart) {
        this.timeStart = timeStart;
    }

    public long getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(long timeEnd) {
        this.timeEnd = timeEnd;
    }

    public long getTimeCollected() {
        return timeCollected;
    }

    public void setTimeCollected(long timeCollected) {
        this.timeCollected = timeCollected;
    }
}
