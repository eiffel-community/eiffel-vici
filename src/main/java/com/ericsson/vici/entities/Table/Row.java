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
package com.ericsson.vici.entities.Table;

import com.ericsson.vici.entities.Eiffel.Outcome;
import com.ericsson.vici.entities.Event;

import java.util.HashMap;

import static com.ericsson.vici.Fetcher.*;
import static com.ericsson.vici.entities.Event.FINISHED;
import static com.ericsson.vici.entities.Event.TRIGGERED;

public class Row {
    private HashMap<String, String> data;


    public Row(Event event) {

        this.data = new HashMap<>();

        data.put("id", event.getId());
        data.put("name", event.getAggregateOn());
        data.put("type", event.getType());

        for (String key : event.getTimes().keySet()) {
            data.put(("time-" + key), String.valueOf(event.getTimes().get(key)));
        }


        switch (event.getType()) {
            case TEST_CASE:
            case ACTIVITY:
            case TEST_SUITE:
                Outcome outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
                if (outcome.getConclusion() != null) {
                    this.data.put("conclusion", outcome.getConclusion());
                }
                if (outcome.getVerdict() != null) {
                    this.data.put("verdict", outcome.getVerdict());
                }
                break;
            case "EiffelConfidenceLevelModifiedEvent":
                this.data.put("result", event.getEiffelEvents().get(TRIGGERED).getData().getValue());
                this.data.put("confidence", event.getEiffelEvents().get(TRIGGERED).getData().getName());
                break;
            default:
                break;
        }
    }

    public HashMap<String, String> getData() {
        return data;
    }

    public void setData(HashMap<String, String> data) {
        this.data = data;
    }
}
