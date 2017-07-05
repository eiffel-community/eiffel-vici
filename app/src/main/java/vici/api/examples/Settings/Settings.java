package vici.api.examples.Settings;

public class Settings {
    private Aggregation aggregation;
    private Details details;
    private EventChain eventChain;
    private Live live;

    public Settings() {
    }

    public Aggregation getAggregation() {
        return aggregation;
    }

    public void setAggregation(Aggregation aggregation) {
        this.aggregation = aggregation;
    }

    public Details getDetails() {
        return details;
    }

    public void setDetails(Details details) {
        this.details = details;
    }

    public EventChain getEventChain() {
        return eventChain;
    }

    public void setEventChain(EventChain eventChain) {
        this.eventChain = eventChain;
    }

    public Live getLive() {
        return live;
    }

    public void setLive(Live live) {
        this.live = live;
    }
}
