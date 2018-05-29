package com.ericsson.vici.api.entities;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static com.ericsson.vici.Fetcher.*;

public class Preferences {
    private String url = null;

    // Cache
    private long cacheLifeTimeMs = 86400000;

    // Aggregation
    private HashMap<String, String> aggregateOn = new HashMap<String, String>() {
        {
            put(ACTIVITY, "data.name");
            put("EiffelAnnouncementPublishedEvent", "data.heading");
            put("EiffelArtifactCreatedEvent", "data.gav.artifactId");
//            put("EiffelArtifactPublishedEvent","data.gav.artifactId"); TODO
            put("EiffelArtifactReusedEvent", "data.gav.artifactId");
            put("EiffelCompositionDefinedEvent", "data.name");
            put("EiffelConfidenceLevelModifiedEvent", "data.name");
            put("EiffelEnvironmentDefinedEvent", "data.name");
            put(TEST_SUITE, "data.name");
            put("EiffelFlowContextDefined", null);
            put("EiffelIssueVerifiedEvent", null); // TODO: -IV: data.issues (notera att detta är en array. Dvs det skulle vara snyggt om samma event kan dyka upp i flera objektrepresentationer i grafen)
            put("EiffelSourceChangeCreatedEvent", "Created@data.gitIdentifier.repoName");// TODO: möjlighet att välja identifier (git/svn/...)
            put("EiffelSourceChangeSubmittedEvent", "Submitted@data.gitIdentifier.repoName");// TODO: möjlighet att välja identifier (git/svn/...)
            put(TEST_CASE, "data.testCase.id");
            put("EiffelTestExecutionRecipeCollectionCreatedEvent", null);
            put(DEFAULT, "data.customData.(key=name)value");
        }
    };

    // Details
    private String detailsTargetId = null;

    // Event chain
    private String eventChainTargetId = null;

    private List<String> eventChainBannedLinks = Arrays.asList("PREVIOUS_VERSION");

    private boolean eventChainGoUpStream = true;
    private boolean eventChainGoDownStream = true;
    private int eventChainMaxSteps = 4;
    private int eventChainMaxConnections = 16;
    private boolean eventChainTimeRelativeXAxis = false;

    // Event chain stream
    private int streamBaseEvents = 1;
    private long streamRefreshIntervalMs = 2000;

    public Preferences() {
    }

    public HashMap<String, String> getAggregateOn() {
        return aggregateOn;
    }

    public void setAggregateOn(HashMap<String, String> aggregateOn) {
        this.aggregateOn = aggregateOn;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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
