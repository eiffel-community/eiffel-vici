package vici.entities.Table;

import org.json.JSONObject;
import vici.entities.Event;

import java.util.HashMap;

public class Row {
    private HashMap<String, String> data;


    public Row(Event event) {

        this.data = new HashMap<>();

        data.put("id", event.getId());
        data.put("name", event.getName());
        data.put("type", event.getType());

        for (String key : event.getTimes().keySet()) {
            data.put(("time-" + key), String.valueOf(event.getTimes().get(key)));
        }


        switch (event.getType()) {
            case "TestCase":
            case "Activity":
            case "TestSuite":
                System.out.println(event.getData().toString());
                JSONObject jsonObject = new JSONObject(event.getData().get("finished"));
                JSONObject outcome = jsonObject.getJSONObject("outcome");
                if (outcome.has("conclusion")) {
                    this.data.put("conclusion", outcome.getString("conclusion"));
                }
                if (outcome.has("verdict")) {
                    this.data.put("verdict", outcome.getString("verdict"));
                }
                break;
            case "EiffelConfidenceLevelModifiedEvent":
                this.data.put("result", new JSONObject(event.getData().get("triggered")).getString("value"));
                this.data.put("confidence", new JSONObject(event.getData().get("triggered")).getString("name"));
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
