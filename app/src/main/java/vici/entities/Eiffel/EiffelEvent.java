package vici.entities.Eiffel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import vici.entities.Link;

import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EiffelEvent {

    private Meta meta;
    private Data data;
    private ArrayList<Link> links;

    public EiffelEvent() {
    }

    public EiffelEvent(Meta meta, Data data, ArrayList<Link> links) {
        this.meta = meta;
        this.data = data;
        this.links = links;
    }

    public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }

    public ArrayList<Link> getLinks() {
        return links;
    }

    public void setLinks(ArrayList<Link> links) {
        this.links = links;
    }
}
