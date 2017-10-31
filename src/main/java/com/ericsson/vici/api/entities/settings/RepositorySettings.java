/*
   Copyright 2017 Ericsson AB.
   For a full list of individual contributors, please see the commit history.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
package com.ericsson.vici.api.entities.settings;

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
