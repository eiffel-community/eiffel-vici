package vici.api.entities.settings;


import java.util.Arrays;
import java.util.List;

public class Settings {
    // EiffelEventRepositories
    private List<EiffelEventRepository> eiffelEventRepositories = Arrays.asList(
            new EiffelEventRepository("Local static dummy file", "localFile[reference-data-set]", 0),
            new EiffelEventRepository("EER static dummy file", "http://127.0.0.1:8081/reference-data-set", 1),
            new EiffelEventRepository("EER [live] dummy event stream", "http://127.0.0.1:8081/live[reference-data-set]", 2),
            new EiffelEventRepository("Docker EER static dummy file", "http://dummy-er:8081/reference-data-set", 3),
            new EiffelEventRepository("Docker EER [live] dummy event stream", "http://dummy-er:8081/live[reference-data-set]", 4)
    );


    public Settings() {
    }

    public List<EiffelEventRepository> getEiffelEventRepositories() {
        return eiffelEventRepositories;
    }

    public void setEiffelEventRepositories(List<EiffelEventRepository> eiffelEventRepositories) {
        this.eiffelEventRepositories = eiffelEventRepositories;
    }
}
