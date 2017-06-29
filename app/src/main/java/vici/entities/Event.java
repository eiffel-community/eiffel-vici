package vici.entities;


import org.bson.Document;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;

public class Event {
    private HashMap<String, String> data;
    private HashMap<String, Long> times;

    private String id;
    private String type;
    private ArrayList<Link> links;
    private String name;

    public Event(Document document) {
        JSONObject jsonObject = new JSONObject(document);

        this.data = new HashMap<>();
        data.put("triggered", jsonObject.getJSONObject("data").toString());

        this.times = new HashMap<>();
        times.put("triggered", jsonObject.getJSONObject("meta").getLong("time"));

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
    }

    public Event(Event event, String redirect) {
//        this.events = event.getEvents();
        this.type = "REDIRECT";
        this.name = redirect;

        this.times = event.getTimes();
    }

    public HashMap<String, String> getData() {
        return data;
    }

    public void setData(HashMap<String, String> data) {
        this.data = data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public ArrayList<Link> getLinks() {
        return links;
    }

    public void setLinks(ArrayList<Link> links) {
        this.links = links;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public HashMap<String, Long> getTimes() {
        return times;
    }

    public void setTimes(HashMap<String, Long> times) {
        this.times = times;
    }
}
