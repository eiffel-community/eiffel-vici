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
package com.ericsson.vici.entities;

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
