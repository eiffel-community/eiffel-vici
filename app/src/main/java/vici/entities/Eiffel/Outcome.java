package vici.entities.Eiffel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Outcome {

    private String verdict;
    private String conclusion;
    private String name;
    private String heading;
    private String body;
    private String severity;

    public Outcome() {
    }

    public Outcome(String verdict, String conclusion, String name, String heading, String body, String severity) {
        this.verdict = verdict;
        this.conclusion = conclusion;
        this.name = name;
        this.heading = heading;
        this.body = body;
        this.severity = severity;
    }

    public String getVerdict() {
        return verdict;
    }

    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }

    public String getConclusion() {
        return conclusion;
    }

    public void setConclusion(String conclusion) {
        this.conclusion = conclusion;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHeading() {
        return heading;
    }

    public void setHeading(String heading) {
        this.heading = heading;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}
