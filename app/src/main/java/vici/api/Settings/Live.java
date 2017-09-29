package vici.api.Settings;

public class Live {
    private int startingEvents;
    private long timeInterval;

    public Live() {
    }

    public int getStartingEvents() {
        return startingEvents;
    }

    public void setStartingEvents(int startingEvents) {
        this.startingEvents = startingEvents;
    }

    public long getTimeInterval() {
        return timeInterval;
    }

    public void setTimeInterval(long timeInterval) {
        this.timeInterval = timeInterval;
    }
}
