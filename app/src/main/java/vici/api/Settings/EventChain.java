package vici.api.Settings;

import java.util.HashSet;

public class EventChain {
    private int steps;
    private boolean upStream;
    private boolean downStream;
    private int maxConnections;
    private boolean relativeXAxis;
    private HashSet<String> bannedLinks;

    public EventChain() {
    }

    public int getSteps() {
        return steps;
    }

    public boolean isRelativeXAxis() {
        return relativeXAxis;
    }

    public void setRelativeXAxis(boolean relativeXAxis) {
        this.relativeXAxis = relativeXAxis;
    }

    public void setSteps(int steps) {
        this.steps = steps;
    }

    public boolean isUpStream() {
        return upStream;
    }

    public void setUpStream(boolean upStream) {
        this.upStream = upStream;
    }

    public boolean isDownStream() {
        return downStream;
    }

    public void setDownStream(boolean downStream) {
        this.downStream = downStream;
    }

    public int getMaxConnections() {
        return maxConnections;
    }

    public void setMaxConnections(int maxConnections) {
        this.maxConnections = maxConnections;
    }

    public HashSet<String> getBannedLinks() {
        return bannedLinks;
    }

    public void setBannedLinks(HashSet<String> bannedLinks) {
        this.bannedLinks = bannedLinks;
    }
}
