package vici.entities.Table;

import vici.entities.Eiffel.Outcome;
import vici.entities.Event;

import java.util.HashMap;

import static vici.Fetcher.*;
import static vici.entities.Event.FINISHED;
import static vici.entities.Event.TRIGGERED;

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
