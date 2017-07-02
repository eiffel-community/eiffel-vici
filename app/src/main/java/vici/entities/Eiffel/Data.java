package vici.entities.Eiffel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Data {
    private String name;
    private String version;
    private String value;
    private String reason;
    private Outcome outcome;
    private ArrayList<CustomData> customData;

    public Data() {
    }

    public Data(String name, String version, String value, String reason, Outcome outcome, ArrayList<CustomData> customData) {
        this.name = name;
        this.version = version;
        this.value = value;
        this.reason = reason;
        this.outcome = outcome;
        this.customData = customData;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Outcome getOutcome() {
        return outcome;
    }

    public void setOutcome(Outcome outcome) {
        this.outcome = outcome;
    }

    public ArrayList<CustomData> getCustomData() {
        return customData;
    }

    public void setCustomData(ArrayList<CustomData> customData) {
        this.customData = customData;
    }
}
