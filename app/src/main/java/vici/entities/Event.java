package vici.entities;


import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;

public class Event {
    private Document event;

    private String id;
    private String type;
    private ArrayList<Link> links;
    private String name;
    private long time;

    public Event(Document document) {
        this.event = document;
        JSONObject jsonObject = new JSONObject(document);

        id = jsonObject.getJSONObject("meta").getString("id");
        type = jsonObject.getJSONObject("meta").getString("type");

        JSONArray linksJson = jsonObject.getJSONArray("links");
        links = new ArrayList<>();
        if (linksJson != null) {
            for (int i = 0; i < linksJson.length(); i++) {
                links.add(new Link(linksJson.getJSONObject(i).getString("target"), linksJson.getJSONObject(i).getString("type")));
            }
        }

        name = null;
        JSONArray customDataJson = jsonObject.getJSONObject("data").getJSONArray("customData");
        if (customDataJson != null) {
            for (int i = 0; i < customDataJson.length(); i++) {
                if (customDataJson.getJSONObject(i).getString("key").equals("name")) {
                    name = customDataJson.getJSONObject(i).getString("value");
                    break;
                }
            }
        }

        time = jsonObject.getJSONObject("meta").getInt("time");

    }

    public Document getEvent() {
        return event;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public ArrayList<Link> getLinks() {
        return links;
    }

    public String getName() {
        return name;
    }

    public long getTime() {
        return time;
    }
}
