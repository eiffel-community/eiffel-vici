package vici.entities;

public class EventCache {
    private Events events;
    private long lastUpdate;


    public EventCache(Events events) {
        this.events = events;
        this.lastUpdate = System.currentTimeMillis();
    }

    public EventCache(Events events, long lastUpdate) {
        this.events = events;
        this.lastUpdate = lastUpdate;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public Events getEvents() {
        return events;
    }

    public void setEvents(Events events) {
        this.events = events;
    }
}
