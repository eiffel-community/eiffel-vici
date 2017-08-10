package vici.entities;


import java.util.ArrayList;

public class Url {
    private String uri;
    private ArrayList<UrlProperty> properties;

    public Url(String uri) {
        this.uri = uri;
        properties = new ArrayList<>();
    }

    public Url(String uri, ArrayList<UrlProperty> properties) {
        this.uri = uri;
        this.properties = properties;
    }

    public void addProperty(String key, String value) {
        properties.add(new UrlProperty(key, value));
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(uri);
        if (properties != null && properties.size() > 0) {
            sb.append("?");
            for (UrlProperty property : properties) {
                sb.append(property.getKey()).append("=").append(property.getValue()).append("&");
            }
        }
        return sb.toString();
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public ArrayList<UrlProperty> getProperties() {
        return properties;
    }

    public void setProperties(ArrayList<UrlProperty> properties) {
        this.properties = properties;
    }
}
