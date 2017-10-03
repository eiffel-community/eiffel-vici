package vici.api.entities.settings;

import java.util.Arrays;
import java.util.List;

public class RepositorySettings {
    // Cache
    private long cacheLifeTimeMs = 86400000;

    // Details
    private String detailsTargetId = null;

    // Event chain
    private String eventChainTargetId = null;

    private List<String> eventChainBannedLinks = Arrays.asList("PREVIOUS_VERSION");

    private boolean eventChainGoUpStream = true;
    private boolean eventChainGoDownStream = true;
    private int eventChainMaxSteps = 5;
    private int eventChainMaxConnections = 16;
    private boolean eventChainTimeRelativeXAxis = false;

    // Event chain stream
    private int streamBaseEvents = 1;
    private long streamRefreshIntervalMs = 2000;

    public RepositorySettings() {
    }

    public long getCacheLifeTimeMs() {
        return cacheLifeTimeMs;
    }

    public void setCacheLifeTimeMs(long cacheLifeTimeMs) {
        this.cacheLifeTimeMs = cacheLifeTimeMs;
    }

    public String getDetailsTargetId() {
        return detailsTargetId;
    }

    public void setDetailsTargetId(String detailsTargetId) {
        this.detailsTargetId = detailsTargetId;
    }

    public String getEventChainTargetId() {
        return eventChainTargetId;
    }

    public void setEventChainTargetId(String eventChainTargetId) {
        this.eventChainTargetId = eventChainTargetId;
    }

    public List<String> getEventChainBannedLinks() {
        return eventChainBannedLinks;
    }

    public void setEventChainBannedLinks(List<String> eventChainBannedLinks) {
        this.eventChainBannedLinks = eventChainBannedLinks;
    }

    public boolean isEventChainGoUpStream() {
        return eventChainGoUpStream;
    }

    public void setEventChainGoUpStream(boolean eventChainGoUpStream) {
        this.eventChainGoUpStream = eventChainGoUpStream;
    }

    public boolean isEventChainGoDownStream() {
        return eventChainGoDownStream;
    }

    public void setEventChainGoDownStream(boolean eventChainGoDownStream) {
        this.eventChainGoDownStream = eventChainGoDownStream;
    }

    public int getEventChainMaxSteps() {
        return eventChainMaxSteps;
    }

    public void setEventChainMaxSteps(int eventChainMaxSteps) {
        this.eventChainMaxSteps = eventChainMaxSteps;
    }

    public int getEventChainMaxConnections() {
        return eventChainMaxConnections;
    }

    public void setEventChainMaxConnections(int eventChainMaxConnections) {
        this.eventChainMaxConnections = eventChainMaxConnections;
    }

    public boolean isEventChainTimeRelativeXAxis() {
        return eventChainTimeRelativeXAxis;
    }

    public void setEventChainTimeRelativeXAxis(boolean eventChainTimeRelativeXAxis) {
        this.eventChainTimeRelativeXAxis = eventChainTimeRelativeXAxis;
    }

    public int getStreamBaseEvents() {
        return streamBaseEvents;
    }

    public void setStreamBaseEvents(int streamBaseEvents) {
        this.streamBaseEvents = streamBaseEvents;
    }

    public long getStreamRefreshIntervalMs() {
        return streamRefreshIntervalMs;
    }

    public void setStreamRefreshIntervalMs(long streamRefreshIntervalMs) {
        this.streamRefreshIntervalMs = streamRefreshIntervalMs;
    }
}
