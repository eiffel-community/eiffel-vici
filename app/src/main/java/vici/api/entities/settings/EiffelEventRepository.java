package vici.api.entities.settings;


public class EiffelEventRepository {
    private int id;
    private String name;
    private String url;
    private RepositorySettings repositorySettings;

    public EiffelEventRepository() {
    }

    public EiffelEventRepository(int id) {
        this.id = id;
        this.name = null;
        this.url = null;
        this.repositorySettings = new RepositorySettings();
    }

    public EiffelEventRepository(String name, String url, int id) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.repositorySettings = new RepositorySettings();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public RepositorySettings getRepositorySettings() {
        return repositorySettings;
    }

    public void setRepositorySettings(RepositorySettings repositorySettings) {
        this.repositorySettings = repositorySettings;
    }
}