package vici.api.entities.settings;


import java.util.Arrays;
import java.util.List;

public class Settings {
    private String version;
    // EiffelEventRepositories
    private List<EiffelEventRepository> eiffelEventRepositories = Arrays.asList(
            new EiffelEventRepository("Local static dummy file", "localFile[reference-data-set]"),
            new EiffelEventRepository("EER static dummy file", "http://127.0.0.1:8081/reference-data-set"),
            new EiffelEventRepository("EER [live] dummy event stream", "http://127.0.0.1:8081/live[reference-data-set]"),
            new EiffelEventRepository("Docker EER static dummy file", "http://dummy-er:8081/reference-data-set"),
            new EiffelEventRepository("Docker EER [live] dummy event stream", "http://dummy-er:8081/live[reference-data-set]")
    );


    public Settings() {
    }

    public Settings(String version) {
        this.version = version;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<EiffelEventRepository> getEiffelEventRepositories() {
        return eiffelEventRepositories;
    }

    public void setEiffelEventRepositories(List<EiffelEventRepository> eiffelEventRepositories) {
        this.eiffelEventRepositories = eiffelEventRepositories;
    }
}
