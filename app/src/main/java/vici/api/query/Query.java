package vici.api.query;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Query {
    private String dlt;
    private String ult;
    private int from = 0;
    private int size = Integer.MAX_VALUE; // TODO: set to default 100
    private boolean pretty = false;
    private String index;
    private boolean includeStartEvent = true;

    public Query() {

    }

    public Query(String dlt, String ult, int from, int size, boolean pretty, String index, boolean includeStartEvent) {
        this.dlt = dlt;
        this.ult = ult;
        this.from = from;
        this.size = size;
        this.pretty = pretty;
        this.index = index;
        this.includeStartEvent = includeStartEvent;
    }

    public String getDlt() {
        return dlt;
    }

    public void setDlt(String dlt) {
        this.dlt = dlt;
    }

    public String getUlt() {
        return ult;
    }

    public void setUlt(String ult) {
        this.ult = ult;
    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public boolean isPretty() {
        return pretty;
    }

    public void setPretty(boolean pretty) {
        this.pretty = pretty;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }

    public boolean isIncludeStartEvent() {
        return includeStartEvent;
    }

    public void setIncludeStartEvent(boolean includeStartEvent) {
        this.includeStartEvent = includeStartEvent;
    }
}
